import { Syringe } from '@antv/g';

export const DragndropPluginOptions = Syringe.defineToken('DragndropPluginOptions');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface DragndropPluginOptions {
  /**
   * How drops are checked for. The allowed values are:
   * - 'pointer' – the pointer must be over the dropzone (default)
   * - 'center' – the draggable element’s center must be over the dropzone
   * @see https://interactjs.io/docs/dropzone/#accept
   */
  overlap: 'pointer' | 'center';

  /**
   * Since Canvas & Document don't have `draggable` attribute,
   * we need to add an extra option.
   */
  isDocumentDraggable: boolean;
}
