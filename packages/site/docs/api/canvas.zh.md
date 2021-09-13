---
title: 画布
order: -100
---

我们在 G 核心包 `@antv/g` 中提供了 Canvas 画布这一核心对象，它就是一个“虚拟世界”，承载着以下三类对象：

-   [场景图](/zh/docs/guide/diving-deeper/scenegraph)。我们通过它描述场景中的各个图形及其层次关系。
-   [相机](/zh/docs/api/camera)。我们通过它定义观察整个场景的角度。我们为每一个画布内置了一个默认使用正交投影的相机，后续可随时修改。
-   [渲染器](/zh/docs/api/renderer)。我们通过它指定画布使用何种底层技术来渲染场景。不同的渲染器有着不同的渲染能力，例如只有 `g-webgl` 才能渲染 3D 图形。在 2D 场景下我们会尽力实现不同渲染器下一致的渲染效果。

在设计画布 API 时，我们参考了 DOM API，因此它们有着很多相似之处：

-   画布可以类比成浏览器环境中的 [window](https://developer.mozilla.org/en-US/docs/Web/API/Window) 对象。和 window 一样，在内部实现中我们也让画布继承了 [EventTarget](/zh/docs/api/builtin-objects/event-target)。与 window 不同的是，在同一个页面中，多个画布可以共存，即可以同时存在多个“平行世界”。
-   在 DOM 树中页面的入口为 [window.document](https://developer.mozilla.org/en-US/docs/Web/API/Document)，在画布中为 `canvas.document`。
-   在 DOM 树中根节点为 [document.documentElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement)，也就是 `<html>`。在画布中同样可以通过 `canvas.document.documentElement` 访问。

我们选择尽可能兼容 DOM API，一方面降低了前端使用者的记忆学习成本，另一方面可以充分利用现有的 Web 生态，例如可以无缝接入[现有的手势和拖拽库](/zh/docs/api/event#手势和拖拽)。

# 继承自

[EventTarget](/zh/docs/api/builtin-objects/event-target)

# 初始化

在创建一个画布时，我们需要传入以下初始化参数：

-   画布容器的 id 或 DOM 元素
-   画布宽度和高度
-   渲染器

```js
import { Canvas } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';

// 创建渲染器
const webglRenderer = new WebGLRenderer();

// 创建画布
const canvas = new Canvas({
    container: 'container', // 画布 DOM 容器 id
    width: 600, // 画布尺寸
    height: 500,
    renderer: webglRenderer, // 指定渲染器
});
```

# 坐标系

为了保持与 Canvas 屏幕坐标系的一致，我们设定画布的原点`(0, 0)`为左上角，X 轴正向指向屏幕右侧，Y 轴正向指向屏幕下方。下图为“世界坐标系”，涉及到旋转时，我们设定沿坐标轴正向顺时针为旋转方向。

![](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes/canvas_default_grid.png)

⚠️ 如果使用了 [g-plugin-3d](/zh/docs/plugins/3d) 插件，Z 轴正向指向屏幕外。

除了 Canvas 坐标系，还有基于浏览器的 Client 坐标系，此时会考虑 Canvas 所属的 DOM 元素在页面中的位置，可以通过以下方法转换坐标。

## getPointByClient(clientX: number, clientY: number)

根据 Client 坐标，获取对应的 Canvas 坐标，返回类型为 `Point`。例如 `<canvas>` 距离浏览器左上角 `[100, 100]` 处：

```js
canvas.getPointByClient(100, 100); // Point { x: 0, y: 0 }
```

其中 Point 结构为 `{ x: number; y: number; }`

## getClientByPoint(x: number, y: number)

根据 Canvas 坐标，获取对应的 Client 坐标，返回类型为 `Point`

```js
canvas.getClientByPoint(0, 0); // Point { x: 100, y: 100 }
```

# 入口与根节点

我们都知道浏览器中的 `window` 对象，DOM 树的入口为 `window.document`，而入口中通常会包含一个根节点 `<html>` 元素，它可以通过 `window.document.documentElement` 获得。我们向这个根节点下添加各种 DOM 元素，例如 `<head>` `<body>` 等。

Canvas 画布可以类比到 `window` 对象。与之类似，每一个画布在创建时都内置了一个入口 [Document](/zh/docs/api/builtin-objects/document)，可以通过 `canvas.document` 获取。这个入口包含了[场景图](/zh/docs/guide/diving-deeper/scenegraph)的根节点，这个根节点可以通过 `canvas.document.documentElement` 获取，随后可以通过 `appendChild` 向这个根节点中添加图形完成渲染。

## document

返回一个内置的 [Document](/zh/docs/api/builtin-objects/document) 对象，它拥有场景图的根节点。通过 `document.documentElement` 获取到这个根节点后，可以使用场景图能力添加子节点：

```js
// 向画布中添加一个 Circle
canvas.document.documentElement.appendChild(circle);
canvas.document.documentElement.children; // [circle]
```

除了添加/删除节点能力，其他场景图能力、事件能力也都可以在根节点上使用：

```js
canvas.document.documentElement.getBounds(); // 获取当前场景包围盒大小
canvas.document.addEventListener('click', () => {}); // 绑定事件
```

## getRoot(): Group

`canvas.document.documentElement` 的别名，因此以下两种写法等价：

```js
const root = canvas.getRoot();
const root = canvas.document.documentElement;
```

# 添加/删除场景图节点

由于画布并没有继承 [Node](/zh/docs/api/builtin-objects/node)，因此它本身并不具备节点操作能力。但我们增加了一些快捷方式，以下节点操作本质上都是在根节点上完成的，例如以下两种写法等价：

```js
canvas.appendChild(circle);
canvas.document.documentElement.appendChild(circle);
```

## appendChild(object: DisplayObject)

向画布中添加待渲染对象。如果该对象有子节点也会一并加入。

```js
const circle = new Circle({ style: { r: 10 } });

canvas.appendChild(circle);
// or canvas.document.documentElement.appendChild(circle);
```

## removeChild(object: DisplayObject)

从画布中移除对象。如果该对象有子节点也会一并移除。

```js
canvas.removeChild(circle);
// or canvas.document.documentElement.removeChild(circle);
```

## removeChildren()

移除并销毁画布中所有对象。

```js
canvas.removeChildren();
// or canvas.document.documentElement.removeChildren();
```

# 修改初始化配置

在初始化画布时我们传入了画布尺寸、渲染器等配置，后续可能对它们进行修改，因此我们提供了以下 API。

## resize(width: number, height: number)

有时我们需要在初始化之后调整画布尺寸，例如当容器尺寸变化时：

```js
canvas.resize(1000, 1000);
```

## setRenderer(renderer: Renderer)

在绝大部分场景下我们都应该在画布初始化时指定一个渲染器，后续再也不会更改。但也有小部分场景需要在运行时[切换渲染器](/zh/docs/guide/diving-deeper/switch-renderer#运行时切换)，例如 G 官网中几乎所有的示例都是这样做的：

```js
// 当图元数目很多时切换到 WebGL 渲染器
if (tooManyShapes) {
    canvas.setRenderer(webglRenderer);
} else {
    canvas.setRenderer(svgRenderer);
}
```

# 生命周期

在实例化时会进行初始化逻辑，随后可调用以下生命周期方法。

## render()

渲染画布，由于渲染器默认开启了自动渲染，大多数情况下不需要手动调用。但有些场景需要手动控制渲染时机，此时可以进行[按需渲染](/zh/docs/guide/diving-deeper/rendering-on-demand) [示例](/zh/examples/canvas#rendering-on-demand)：

```js
// 关闭自动渲染
const webglRenderer = new WebGLRenderer({
    enableAutoRendering: false,
});

canvas.render();
```

## destroy(destroyScenegraph = true)

销毁画布，依次执行以下销毁逻辑：

-   如果开启了自动渲染，停止主渲染循环
-   将整个场景图从画布中移除，如果设置了 `destroyScenegraph` 还会销毁整个场景图
-   销毁渲染上下文

```js
// 仅销毁画布，保留场景图
canvas.destroy();

// 一并销毁画布中的场景图
canvas.destroy(true);
```

# 获取内置对象

通过以下方法可以快速获取画布中的一些内置对象。

## getConfig(): CanvasConfig

获取初始传入画布的配置。

```js
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: webglRenderer,
});
canvas.getConfig(); // { container: 'container', width: 600, ... }
```

## getContextService(): ContextService

获取[渲染上下文](/zh/docs/api/renderer#渲染环境上下文)，由渲染器（`g-canvas/svg/webgl`）实现。该渲染上下文上有很多常用的方法，例如：

-   getDomElement() 返回上下文所处的 DOM 元素，例如 `g-canvas/webgl` 会返回 `<canvas>`，而 `g-svg` 会返回 `<svg>`
-   getDPR() 返回上下文的 devicePixelRatio

## getCamera(): Camera

获取[相机](/zh/docs/api/camera)，后续可对该相机进行操作，例如切换投影模式、完成相机动作和动画等。

```js
const camera = canvas.getCamera();

// 相机动作
camera.pan();
camera.rotate();

// 切换透视投影模式
camera
    .setPosition(300, 100, 500)
    .setFocalPoint(300, 250, 0)
    .setPerspective(0.1, 1000, 75, 600 / 500);
```

# 事件

在[事件系统](/zh/docs/api/event)中，大部分事件都会冒泡直至画布。例如我们在如下简单场景下点击 Circle，可以查看事件的传播路径依次为：

```
Circle -> Group(canvas.document.documentElement) -> Document(canvas.document) -> Canvas：
```

```js
canvas.addEventListener('click', (e) => {
    e.propagationPath(); // [Circle, Group, Document, Canvas]
});
```

## 绑定/解绑

在 Canvas 画布和画布根节点上都可以绑定事件：

```js
// 在画布上绑定
canvas.addEventListener('click', () => {});

// 在画布根节点上绑定
canvas.document.addEventListener('click', () => {});
```

更多事件相关操作详见[事件系统](/zh/docs/api/event)

## 画布特有事件

目前可以监听以下画布相关事件：

-   `beforerender` 在每一帧渲染前触发
-   `afterrender` 在每一帧渲染后触发
-   `beforedestroy` 在销毁前触发
-   `afterdestroy` 在销毁后触发

例如我们在官网所有例子中展示实时帧率，该组件在每次渲染后更新：

```js
canvas.on('afterrender', () => {
    stats.update();
});
```

# 注意事项

## 多个画布共存

在同一个页面中，多个画布可以共存，即可以同时存在多个“平行世界”。但受限于底层渲染 API，例如 WebGL 只允许至多 8 个上下文。

[示例](/zh/examples/canvas#multi-canvas)