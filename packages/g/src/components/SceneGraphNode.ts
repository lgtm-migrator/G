import { Component } from '@antv/g-ecs';
import type { BaseStyleProps, SHAPE } from '../types';

/**
 * scene graph node, try to mimic `Element`
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode
 */
export class SceneGraphNode<StyleProps extends BaseStyleProps> extends Component {
  static tag = 'c-scene-graph-node';

  /**
   * used with `getElementById()`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/id
   */
  id: string;

  /**
   * used with `getElementsByClassName()`
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class
   */
  class: string;

  /**
   * used with `getElementsByName()`
   * @see https://developer.mozilla.org/en-US/docs/Web/Element/name
   */
  name: string;

  /**
   * used with `getElementsByTagName()`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName
   */
  tagName: SHAPE | string;

  /**
   * assigned by shape.attrs
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes
   */
  attributes: StyleProps = {} as StyleProps;

  /**
   * shadow node, invisible in scene graph, which means cannot be queried
   */
  shadow = false;

  /**
   * enable interaction
   */
  interactive = true;
}