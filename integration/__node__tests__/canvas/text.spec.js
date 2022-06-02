const { createCanvas } = require('canvas');
const fs = require('fs');
const { Text, Canvas } = require('@antv/g');
const { Renderer } = require('@antv/g-canvas');
const { sleep, diff } = require('../../util');

// create a node-canvas
const nodeCanvas = createCanvas(200, 200);
const offscreenNodeCanvas = createCanvas(1, 1);

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer();
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);

const SIZE = 200;
const canvas = new Canvas({
  width: SIZE,
  height: SIZE,
  canvas: nodeCanvas, // use node-canvas
  renderer,
  offscreenCanvas: offscreenNodeCanvas,
});

const RESULT_IMAGE = '/text.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Text> with g-canvas', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render text on server-side correctly.', async () => {
    await canvas.ready;
    const text1 = new Text({
      style: {
        x: 10,
        y: 10,
        text: 'test',
        fill: 'red',
      },
    });
    canvas.appendChild(text1);

    // CJK
    const text2 = text1.cloneNode();
    text2.style.fontSize = '16px';
    text2.style.text = '中文';
    text2.style.textAlign = 'center';
    text2.style.textBaseline = 'middle';
    text2.setPosition(100, 100);
    canvas.appendChild(text2);

    // word wrap
    const text3 = text1.cloneNode();
    text3.style.text = 'aaaaaaaaaaaaaaaaaaaaa';
    text3.style.wordWrap = true;
    text3.style.wordWrapWidth = 80;
    text3.setPosition(100, 80);
    canvas.appendChild(text3);

    // with stroke
    const text4 = text1.cloneNode();
    text4.style.stroke = 'white';
    text4.style.lineWidth = 2;
    text4.setPosition(10, 80);
    canvas.appendChild(text4);

    // text transform
    const text5 = text1.cloneNode();
    text5.style.textTransform = 'capitalize';
    text5.setPosition(10, 60);
    canvas.appendChild(text5);
    const text6 = text1.cloneNode();
    text6.style.textTransform = 'uppercase';
    text6.setPosition(10, 40);
    canvas.appendChild(text6);

    // letter spacing
    const text7 = text1.cloneNode();
    text7.style.letterSpacing = 2;
    text7.setPosition(10, 100);
    canvas.appendChild(text7);

    // dx/dy
    const text8 = text1.cloneNode();
    text8.style.dx = 20;
    text8.style.dy = 10;
    text8.setPosition(10, 120);
    canvas.appendChild(text8);

    await sleep(300);

    await new Promise((resolve) => {
      const out = fs.createWriteStream(__dirname + RESULT_IMAGE);
      const stream = nodeCanvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => {
        resolve(undefined);
      });
    });

    expect(diff(__dirname + RESULT_IMAGE, __dirname + BASELINE_IMAGE_DIR + RESULT_IMAGE)).toBe(0);
  });
});
