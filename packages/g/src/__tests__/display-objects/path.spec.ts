import { AABB, Path } from '@antv/g';
import type { PathArray } from '@antv/util';
import { expect } from 'chai';
import { vec3 } from 'gl-matrix';

describe('Path', () => {
  it('should support empty path definition', () => {
    // use empty string
    const path = new Path({
      style: {
        path: '',
        lineWidth: 10,
      },
    });

    let bounds = path.getBounds();
    expect(AABB.isEmpty(bounds)).to.be.true;
    expect(bounds.center).eqls(vec3.fromValues(0, 0, 0));
    expect(bounds.halfExtents).eqls(vec3.fromValues(0, 0, 0));

    // use empty path array
    // @ts-ignore
    path.style.path = [];
    bounds = path.getBounds();
    expect(AABB.isEmpty(bounds)).to.be.true;
    expect(bounds.center).eqls(vec3.fromValues(0, 0, 0));
    expect(bounds.halfExtents).eqls(vec3.fromValues(0, 0, 0));
  });

  it('should calc global bounds correctly', () => {
    const pathArray: PathArray = [
      ['M', 0, 0],
      ['L', 100, 0],
    ];

    const path = new Path({
      style: {
        path: pathArray,
        lineWidth: 10,
      },
    });

    // get local position, left top corner
    expect(path.getLocalPosition()).eqls(vec3.fromValues(0, 0, 0));

    // get length
    expect(path.getTotalLength()).eqls(100);

    path.style.setProperty('d', 'M 0 0 L 200 0');
    expect(path.getLocalPosition()).eqls(vec3.fromValues(0, 0, 0));
    expect(path.getTotalLength()).eqls(200);

    // // get bounds
    // let bounds = polyline.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(250, 225, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(210, 185, 0));
    // }

    // // change lineWidth
    // polyline.style.lineWidth = 20;
    // bounds = polyline.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(250, 225, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(220, 195, 0));
    // }

    // // change first point
    // let newPoints = [...points];
    // newPoints[0] = [0, 0];
    // polyline.style.points = newPoints;
    // expect(polyline.getLocalPosition()).eqls(vec3.fromValues(0, 0, 0));
    // bounds = polyline.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(225, 200, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(245, 220, 0));
    // }

    // polyline.translate(100, 0);

    // // restore
    // newPoints = [...points];
    // newPoints[0] = [50, 50];
    // polyline.style.points = newPoints;
    // expect(polyline.getLocalPosition()).eqls(vec3.fromValues(150, 50, 0));
    // bounds = polyline.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(350, 225, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(220, 195, 0));
    // }
    // expect(polyline.getTotalLength()).eqls(750);
  });

  it('should handle invalid path correctly', () => {
    const pathArray: PathArray = [
      // @ts-ignore
      ['XX', 0, 0],
    ];

    const path = new Path({
      style: {
        path: pathArray,
        lineWidth: 10,
      },
    });

    expect(path.getTotalLength()).eqls(0);

    const point = path.getPoint(0)!;
    expect(point.x).eqls(0);
    expect(point.y).eqls(0);
  });

  it('should use `d` property in path correctly', () => {
    const pathArray: PathArray = [
      ['M', 0, 0],
      ['L', 10, 0],
    ];

    const path = new Path({
      style: {
        d: pathArray,
        lineWidth: 10,
      },
    });

    expect(path.getTotalLength()).eqls(10);
  });

  it('should getPoint at ratio correctly', () => {
    const pathArray: PathArray = [
      ['M', 0, 0],
      ['L', 100, 0],
    ];

    const path = new Path({
      style: {
        path: pathArray,
        lineWidth: 10,
      },
    });

    let point = path.getPoint(0);
    expect(point.x).eqls(0);
    expect(point.y).eqls(0);

    point = path.getPoint(0.5);

    expect(point.x).eqls(50);
    expect(point.y).eqls(0);

    point = path.getPoint(1);
    expect(point.x).eqls(100);
    expect(point.y).eqls(0);

    point = path.getPoint(10);
    expect(point.x).eqls(100);
    expect(point.y).eqls(0);

    point = path.getPointAtLength(0);
    expect(point.x).eqls(0);
    expect(point.y).eqls(0);

    point = path.getPointAtLength(50);
    expect(point.x).eqls(50);
    expect(point.y).eqls(0);
  });

  it('should getPoint on a quad bezier correctly', () => {
    const pathArray: PathArray = [
      ['M', 968, 400],
      ['Q', 913, 400, 858, 400],
    ];

    const path = new Path({
      style: {
        path: pathArray,
        lineWidth: 10,
      },
    });
    path.translate(-800, -150);

    let point = path.getPoint(0);
    expect(point.x).eqls(168);
    expect(point.y).eqls(250);

    point = path.getPoint(0.5);
    expect(point.x).eqls(113);
    expect(point.y).eqls(250);

    point = path.getPoint(1);
    expect(point.x).eqls(58);
    expect(point.y).eqls(250);

    // point = path.getPoint(10);
    // expect(point.x).eqls(100);
    // expect(point.y).eqls(0);
  });

  it('should calc tangent correctly', () => {
    const pathArray: PathArray = [
      ['M', 0, 0],
      ['L', 100, 0],
    ];

    const path = new Path({
      style: {
        path: pathArray,
        lineWidth: 10,
      },
    });

    expect(path.getStartTangent()).eqls([
      [50, 0],
      [0, 0],
    ]);

    expect(path.getEndTangent()).eqls([
      [68.75, 0],
      [100, 0],
    ]);
  });
});