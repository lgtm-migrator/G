import { Canvas, CustomElement, Polyline } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const svgRenderer = new SVGRenderer();
const webglRenderer = new WebGLRenderer();
const webgpuRenderer = new WebGPURenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

class MyCustomElement extends CustomElement {
  connectedCallback() {
    this.appendChild(new Polyline({ style: { points: '100,100 200,200', stroke: 'red' } }));
  }
}
const myCustomElement = new MyCustomElement();
canvas.appendChild(myCustomElement);

myCustomElement.animate();

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.on('afterrender', () => {
  if (stats) {
    stats.update();
  }
});

// GUI
const gui = new lil.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: 'canvas',
};
rendererFolder
  .add(rendererConfig, 'renderer', ['canvas', 'svg', 'webgl', 'webgpu'])
  .onChange((rendererName) => {
    let renderer;
    if (rendererName === 'canvas') {
      renderer = canvasRenderer;
    } else if (rendererName === 'svg') {
      renderer = svgRenderer;
    } else if (rendererName === 'webgl') {
      renderer = webglRenderer;
    } else if (rendererName === 'webgpu') {
      renderer = webgpuRenderer;
    }
    canvas.setRenderer(renderer);
  });
rendererFolder.open();

const circleFolder = gui.addFolder('circle');
const circleConfig = {
  cx: 300,
  cy: 200,
  r: 100,
  fill: '#1890FF',
  stroke: '#F04864',
  lineWidth: 4,
  lineDash: 0,
  lineDashOffset: 0,
  fillOpacity: 1,
  strokeOpacity: 1,
  shadowColor: '#000',
  shadowBlur: 20,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  increasedLineWidthForHitTesting: 0,
  cursor: 'pointer',
};
circleFolder.add(circleConfig, 'cx', 0, 600).onChange((cx) => {
  circle.style.cx = cx;
});
circleFolder.add(circleConfig, 'cy', 0, 600).onChange((cy) => {
  circle.style.cy = cy;
});
circleFolder.add(circleConfig, 'r', 50, 200).onChange((r) => {
  circle.style.r = r;
});
circleFolder.addColor(circleConfig, 'fill').onChange((color) => {
  circle.style.fill = color;
});
circleFolder.addColor(circleConfig, 'stroke').onChange((color) => {
  circle.attr('stroke', color);
});
circleFolder.addColor(circleConfig, 'shadowColor').onChange((color) => {
  circle.attr('shadowColor', color);
});
circleFolder.add(circleConfig, 'shadowBlur', 0, 100).onChange((shadowBlur) => {
  circle.style.shadowBlur = shadowBlur;
});
circleFolder.add(circleConfig, 'shadowOffsetX', -50, 50).onChange((shadowOffsetX) => {
  circle.style.shadowOffsetX = shadowOffsetX;
});
circleFolder.add(circleConfig, 'shadowOffsetY', -50, 50).onChange((shadowOffsetY) => {
  circle.style.shadowOffsetY = shadowOffsetY;
});
circleFolder.add(circleConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  circle.style.lineWidth = lineWidth;
});
circleFolder.add(circleConfig, 'lineDash', 0, 100).onChange((lineDash) => {
  circle.style.lineDash = [lineDash];
});
circleFolder.add(circleConfig, 'lineDashOffset', 0, 100).onChange((lineDashOffset) => {
  circle.style.lineDashOffset = lineDashOffset;
});
circleFolder.add(circleConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
  circle.style.fillOpacity = opacity;
});
circleFolder.add(circleConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  circle.style.strokeOpacity = opacity;
});
circleFolder
  .add(circleConfig, 'increasedLineWidthForHitTesting', 0, 200)
  .onChange((increasedLineWidthForHitTesting) => {
    circle.style.increasedLineWidthForHitTesting = increasedLineWidthForHitTesting;
  });
circleFolder
  .add(circleConfig, 'cursor', ['default', 'pointer', 'help', 'progress', 'text', 'move'])
  .onChange((cursor) => {
    circle.style.cursor = cursor;
  });

const transformFolder = gui.addFolder('transform');
const transformConfig = {
  localPositionX: 300,
  localPositionY: 200,
  localScale: 1,
  localEulerAngles: 0,
  transformOrigin: 'center',
  anchorX: 0.5,
  anchorY: 0.5,
};
transformFolder
  .add(transformConfig, 'transformOrigin', [
    'left top',
    'center',
    'right bottom',
    '50% 50%',
    '50px 50px',
  ])
  .onChange((transformOrigin) => {
    circle.style.transformOrigin = transformOrigin;
  });
transformFolder.add(transformConfig, 'localPositionX', 0, 600).onChange((localPositionX) => {
  const [lx, ly] = circle.getLocalPosition();
  circle.setLocalPosition(localPositionX, ly);
});
transformFolder.add(transformConfig, 'localPositionY', 0, 500).onChange((localPositionY) => {
  const [lx, ly] = circle.getLocalPosition();
  circle.setLocalPosition(lx, localPositionY);
});
transformFolder.add(transformConfig, 'localScale', 0.2, 5).onChange((localScale) => {
  circle.setLocalScale(localScale);
});
transformFolder.add(transformConfig, 'localEulerAngles', 0, 360).onChange((localEulerAngles) => {
  circle.setLocalEulerAngles(localEulerAngles);
});
transformFolder.add(transformConfig, 'anchorX', 0, 1).onChange((anchorX) => {
  circle.style.anchor = [anchorX, transformConfig.anchorY];
});
transformFolder.add(transformConfig, 'anchorY', 0, 1).onChange((anchorY) => {
  circle.style.anchor = [transformConfig.anchorX, anchorY];
});
transformFolder.open();