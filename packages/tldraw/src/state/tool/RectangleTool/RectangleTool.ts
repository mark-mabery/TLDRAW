import Vec from '@tldraw/vec'
import { Utils, TLPointerEventHandler, TLKeyboardEventHandler, TLBoundsCorner } from '@tldraw/core'
import { Rectangle } from '~shape/shapes'
import { SessionType, TLDrawShapeType } from '~types'
import { BaseTool } from '../BaseTool'

enum Status {
  Idle = 'idle',
  Creating = 'creating',
}

export class RectangleTool extends BaseTool {
  type = TLDrawShapeType.Rectangle

  status = Status.Idle

  /* --------------------- Methods -------------------- */

  onEnter = () => {
    this.setStatus(Status.Idle)
  }

  onExit = () => {
    this.setStatus(Status.Idle)
  }

  /* ----------------- Event Handlers ----------------- */

  onPointerDown: TLPointerEventHandler = (info) => {
    const pagePoint = Vec.round(this.state.getPagePoint(info.point))

    const {
      appState: { currentPageId, currentStyle },
    } = this.state

    const childIndex = this.getNextChildIndex()

    const id = Utils.uniqueId()

    const newShape = Rectangle.create({
      id,
      parentId: currentPageId,
      childIndex,
      point: pagePoint,
      style: { ...currentStyle },
    })

    this.state.createShapes(newShape)

    this.state.startSession(SessionType.Transform, pagePoint, TLBoundsCorner.BottomRight)

    this.setStatus(Status.Creating)
  }

  onPointerMove: TLPointerEventHandler = (info) => {
    if (this.status === Status.Creating) {
      const pagePoint = Vec.round(this.state.getPagePoint(info.point))
      this.state.updateSession(pagePoint, info.shiftKey, info.altKey, info.metaKey)
    }
  }

  onKeyDown: TLKeyboardEventHandler = (key, info) => {
    if (
      (this.status === Status.Creating && key === 'Shift') ||
      key === 'Meta' ||
      key === 'Alt' ||
      key === 'Ctrl'
    ) {
      const pagePoint = Vec.round(this.state.getPagePoint(info.point))
      this.state.updateSession(pagePoint, info.shiftKey, info.altKey, info.metaKey)
    }
  }

  onPointerUp: TLPointerEventHandler = () => {
    if (this.status === Status.Creating) {
      this.state.completeSession()
    }

    this.setStatus(Status.Idle)
  }
}
