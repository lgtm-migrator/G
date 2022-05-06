import {
  DisplayObject,
  RenderingService,
  RenderingPlugin,
  ParsedBaseStyleProps,
  DefaultCamera,
  Camera,
  getEuler,
  fromRotationTranslationScale,
  ParsedCircleStyleProps,
  ParsedEllipseStyleProps,
  ParsedRectStyleProps,
} from '@antv/g';
import { Shape, CanvasConfig, ContextService, RenderingPluginContribution } from '@antv/g';
import { vec3, mat4, quat } from 'gl-matrix';
import { inject, singleton } from 'mana-syringe';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import { Options } from 'roughjs/bin/core';
// @see https://github.com/rough-stuff/rough/issues/145
import rough from 'roughjs/bin/rough';

@singleton({ contrib: RenderingPluginContribution })
export class RoughRendererPlugin implements RenderingPlugin {
  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(DefaultCamera)
  private camera: Camera;

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  private roughCanvas: RoughCanvas;

  private restoreStack: DisplayObject[] = [];

  apply(renderingService: RenderingService) {
    renderingService.hooks.init.tapPromise(async () => {
      // @see https://github.com/rough-stuff/rough/wiki#roughcanvas-canvaselement--config
      this.roughCanvas = rough.canvas(this.contextService.getDomElement() as HTMLCanvasElement);
    });

    renderingService.hooks.destroy.tap(() => {});

    renderingService.hooks.beginFrame.tap(() => {
      const context = this.contextService.getContext();
      context.save();
      context.clearRect(0, 0, this.canvasConfig.width, this.canvasConfig.height);

      // account for camera's world matrix
      this.applyTransform(context, this.camera.getOrthoMatrix());
    });

    renderingService.hooks.render.tap((object: DisplayObject) => {
      const context = this.contextService.getContext();
      // restore to its parent
      let parent = this.restoreStack[this.restoreStack.length - 1];
      while (parent && object.parentNode !== parent) {
        context.restore();
        this.restoreStack.pop();
        parent = this.restoreStack[this.restoreStack.length - 1];
      }

      // reset transformation
      context.save();

      // apply RTS transformation in local space
      // rough.js won't support transform @see https://github.com/rough-stuff/rough/issues/62
      this.applyTransform(context, object.getLocalTransform());

      context.save();

      this.useAnchor(context, object, () => {
        // we only care about visibile and unculled display objects
        if (object.isVisible() && !object.isCulled()) {
          const options = this.generateRoughOptions(object);

          if (object.nodeName === Shape.CIRCLE) {
            const { r } = object.parsedStyle as ParsedCircleStyleProps;
            // rough.js use diameter instead of radius
            this.roughCanvas.circle(r.value, r.value, r.value * 2, options);
          } else if (object.nodeName === Shape.ELLIPSE) {
            const { rx, ry } = object.parsedStyle as ParsedEllipseStyleProps;
            this.roughCanvas.ellipse(rx.value, ry.value, rx.value * 2, ry.value * 2, options);
          } else if (object.nodeName === Shape.RECT) {
            const { width, height } = object.parsedStyle as ParsedRectStyleProps;
            this.roughCanvas.rectangle(0, 0, width.value, height.value);
          } else if (object.nodeName === Shape.PATH) {
          }
          // TODO: other shapes
        }
      });

      context.restore();

      // finish rendering, clear dirty flag
      object.renderable.dirty = false;

      this.restoreStack.push(object);
    });

    renderingService.hooks.endFrame.tap(() => {
      const context = this.contextService.getContext();

      // pop restore stack, eg. root -> parent -> child
      this.restoreStack.forEach((s) => {
        context.restore();
      });
      // clear restore stack
      this.restoreStack = [];
      context.restore();
    });
  }

  private generateRoughOptions(object: DisplayObject) {
    const {
      bowing,
      roughness,
      fill,
      stroke,
      lineWidth,
      seed,
      fillStyle,
      fillWeight,
      hachureAngle,
      hachureGap,
      curveStepCount,
      curveFitting,
      lineDash,
      lineDashOffset,
      fillLineDash,
      fillLineDashOffset,
      disableMultiStroke,
      disableMultiStrokeFill,
      simplification,
      dashOffset,
      dashGap,
      zigzagOffset,
      preserveVertices,
    } = object.parsedStyle as ParsedBaseStyleProps & Options;

    // @see https://github.com/rough-stuff/rough/wiki#options
    const options: Options = {
      bowing,
      roughness,
      seed: seed || object.entity,
      fill: fill.toString(),
      stroke: stroke.toString(),
      strokeWidth: lineWidth?.value,
      fillStyle,
      fillWeight,
      hachureAngle,
      hachureGap,
      curveStepCount,
      curveFitting,
      strokeLineDash: lineDash?.map((d) => d.value) || [],
      strokeLineDashOffset: lineDashOffset?.value,
      fillLineDash,
      fillLineDashOffset,
      disableMultiStroke,
      disableMultiStrokeFill,
      simplification,
      dashOffset,
      dashGap,
      zigzagOffset,
      preserveVertices,
    };

    // remove all undefined values
    Object.keys(options).forEach((key) => {
      if (options[key] === undefined) {
        delete options[key];
      }
    });

    return options;
  }

  /**
   * apply transform to context, eg. camera's view matrix, object's local transformation
   */
  private applyTransform(context: CanvasRenderingContext2D, transform: mat4) {
    const [tx, ty] = mat4.getTranslation(vec3.create(), transform);
    const [sx, sy] = mat4.getScaling(vec3.create(), transform);
    const rotation = mat4.getRotation(quat.create(), transform);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [eux, euy, euz] = getEuler(vec3.create(), rotation);
    // gimbal lock at 90 degrees
    const rts = fromRotationTranslationScale(eux || euz, tx, ty, sx, sy);

    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
    context.transform(rts[0], rts[1], rts[3], rts[4], rts[6], rts[7]);
  }

  /**
   * account for `anchor` definition of different shapes
   */
  private useAnchor(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    callback: () => void,
  ): void {
    const contentBounds = object.getGeometryBounds();
    if (contentBounds) {
      const { halfExtents } = contentBounds;

      // apply anchor, use true size, not include stroke,
      // eg. bounds = true size + half lineWidth
      const { anchor } = (object.parsedStyle || {}) as ParsedBaseStyleProps;
      context.translate(
        -((anchor && anchor[0].value) || 0) * halfExtents[0] * 2,
        -((anchor && anchor[1].value) || 0) * halfExtents[1] * 2,
      );

      callback();
    } else {
      callback();
    }
  }
}
