import { Canvas, CanvasEvent, Rect } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * <gradient>
 * e.g. linear-gradient(0deg, blue, green 40%, red)
 *      radial-gradient(circle at center, red 0, blue, green 100%)
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/linear-gradient
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/radial-gradient
 *
 * interactive demo:
 * @see https://observablehq.com/@danburzo/css-gradient-line
 */

// create a renderer
const canvasRenderer = new CanvasRenderer();
const svgRenderer = new SVGRenderer();
const webglRenderer = new WebGLRenderer();
const webgpuRenderer = new WebGPURenderer();
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

// single linear gradient
const rect1 = new Rect({
  style: {
    x: 50,
    y: 50,
    width: 200,
    height: 100,
    fill: 'linear-gradient(0deg, blue, green 40%, red)',
  },
});

// multi linear gradients
const rect2 = new Rect({
  style: {
    x: 50,
    y: 250,
    width: 200,
    height: 100,
    fill: `linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%),
            linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%),
            linear-gradient(336deg, rgba(0,0,255,.8), rgba(0,0,255,0) 70.71%)`,
  },
});

// single radial gradient
const rect3 = new Rect({
  style: {
    x: 350,
    y: 50,
    width: 200,
    height: 100,
    fill: 'radial-gradient(circle at center, red, blue, green 100%)',
  },
});

// hard stop
const rect4 = new Rect({
  style: {
    x: 350,
    y: 250,
    width: 200,
    height: 100,
    fill: 'radial-gradient(red 50%, blue 50%)',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(rect1);
  canvas.appendChild(rect2);
  canvas.appendChild(rect3);
  canvas.appendChild(rect4);
});

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
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
  .add(rendererConfig, 'renderer', ['canvas', 'svg', 'webgl', 'webgpu', 'canvaskit'])
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
    } else if (rendererName === 'canvaskit') {
      renderer = canvaskitRenderer;
    }
    canvas.setRenderer(renderer);
  });
rendererFolder.open();

const linearGradientFolder = gui.addFolder('linear gradient');
const linearGradientConfig = {
  angle: 0,
  width: 200,
  height: 100,
  'side or corner': 'to right',
  'green color stop(%)': 40,
};
linearGradientFolder.add(linearGradientConfig, 'angle', 0, 360).onChange((angle) => {
  rect1.style.fill = `linear-gradient(${angle}deg, blue, green 40%, red)`;
});
linearGradientFolder
  .add(linearGradientConfig, 'side or corner', [
    'to left',
    'to top',
    'to bottom',
    'to right',
    'to left top',
    'to top left',
    'to left bottom',
    'to bottom left',
    'to right top',
    'to top right',
    'to right bottom',
    'to bottom right',
  ])
  .onChange((direction) => {
    rect1.style.fill = `linear-gradient(${direction}, blue, green 40%, red)`;
  });
linearGradientFolder
  .add(linearGradientConfig, 'green color stop(%)', 0, 100)
  .onChange((percentage) => {
    rect1.style.fill = `linear-gradient(0deg, blue, green ${percentage}%, red)`;
  });
linearGradientFolder.add(linearGradientConfig, 'width', 50, 400).onChange((width) => {
  rect1.style.width = width;
});
linearGradientFolder.add(linearGradientConfig, 'height', 50, 400).onChange((height) => {
  rect1.style.height = height;
});

const radialGradientFolder = gui.addFolder('radial gradient');
const radialGradientConfig = {
  position: 'center',
  'green color stop(%)': 100,
};
radialGradientFolder
  .add(radialGradientConfig, 'position', [
    'top',
    'left',
    'bottom',
    'right',
    'center',
    'top left',
    'left top',
    'top right',
    'bottom left',
    'bottom right',
    '25% 25%',
    '50% 50%',
  ])
  .onChange((position) => {
    rect3.style.fill = `radial-gradient(circle at ${position}, red, blue, green 100%)`;
  });
radialGradientFolder
  .add(radialGradientConfig, 'green color stop(%)', 0, 100)
  .onChange((percentage) => {
    rect3.style.fill = `radial-gradient(circle at center, red, blue, green ${percentage}%)`;
  });