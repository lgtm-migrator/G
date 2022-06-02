import { Canvas, CanvasEvent, Image } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * Drag'n'Drop with PointerEvents
 * @see https://javascript.info/mouse-drag-and-drop
 */

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const gate = new Image({
  className: 'droppable',
  style: {
    width: 200,
    height: 100,
    src: 'https://en.js.cx/clipart/soccer-gate.svg',
  },
});

const ball = new Image({
  style: {
    x: 300,
    y: 200,
    width: 100,
    height: 100,
    src: 'https://en.js.cx/clipart/ball.svg',
    cursor: 'pointer',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(gate);
  canvas.appendChild(ball);

  ball.addEventListener('pointerdown', function (event) {
    let shiftX = event.clientX - ball.getBoundingClientRect().left;
    let shiftY = event.clientY - ball.getBoundingClientRect().top;

    moveAt(event.canvasX, event.canvasY);

    function moveAt(canvasX, canvasY) {
      ball.style.x = canvasX - shiftX + 'px';
      ball.style.y = canvasY - shiftY + 'px';
    }

    async function onMouseMove(event) {
      moveAt(event.canvasX, event.canvasY);
    }

    canvas.document.addEventListener('pointermove', onMouseMove);

    ball.addEventListener(
      'pointerup',
      function () {
        canvas.document.removeEventListener('pointermove', onMouseMove);
      },
      { once: true },
    );
  });
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
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.open();
