import CodeShape from './index'
import { uniqueId } from 'utils'
import { TextShape, ShapeProps, ShapeType, FontSize } from 'types'
import { defaultStyle } from 'state/shape-styles'

/* ----------------- Start Copy Here ---------------- */

export default class Text extends CodeShape<TextShape> {
  constructor(props = {} as ShapeProps<TextShape>) {
    super({
      id: uniqueId(),

      parentId: (window as any).currentPageId,
      type: ShapeType.Text,
      isGenerated: true,
      name: 'Text',
      childIndex: 0,
      point: [0, 0],
      rotation: 0,
      isAspectRatioLocked: false,
      isLocked: false,
      isHidden: false,
      text: 'Text',
      scale: 1,
      fontSize: FontSize.Medium,
      ...props,
      style: {
        ...defaultStyle,
        ...props.style,
      },
    })
  }
}
