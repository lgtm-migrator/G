import { Circle, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

/**
 * ported from https://animista.net/play/entrances/scale-in
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

const circle = new Circle({
  style: {
    x: 200,
    y: 200,
    r: 60,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    shadowColor: 'black',
    shadowBlur: 30,
  },
});

canvas.appendChild(circle);

const animation = circle.animate(
  [
    {
      transform: 'scale(1)',
      fill: '#1890FF',
      stroke: '#F04864',
      opacity: 1,
      shadowColor: 'black',
      shadowBlur: 30,
    },
    {
      transform: 'scale(2)',
      fill: 'red',
      stroke: '#1890FF',
      opacity: 0.8,
      shadowColor: 'red',
      shadowBlur: 0,
    },
  ],
  {
    duration: 1500,
    iterations: Infinity,
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  },
);

// get triggerred when animation finished
animation.onfinish = (e) => {
  console.log('finish!', e.target, e.target.playState);
};
animation.finished.then(() => {
  console.log('finish promise resolved');
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
canvas.on('afterRender', () => {
  if (stats) {
    stats.update();
  }
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
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

const animationFolder = gui.addFolder('animation');
const animationConfig = {
  play: () => {
    animation.play();
  },
  pause: () => {
    animation.pause();
  },
  reverse: () => {
    animation.reverse();
  },
  finish: () => {
    animation.finish();
  },
};
animationFolder.add(animationConfig, 'play').name('Play');
animationFolder.add(animationConfig, 'pause').name('Pause');
animationFolder.add(animationConfig, 'reverse').name('Reverse');
animationFolder.add(animationConfig, 'finish').name('Finish');
animationFolder.open();