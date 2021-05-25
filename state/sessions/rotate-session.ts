import { Data } from "types"
import * as vec from "utils/vec"
import BaseSession from "./base-session"
import commands from "state/commands"
import { current } from "immer"
import {
  clampToRotationToSegments,
  getBoundsCenter,
  getCommonBounds,
  getPage,
  getSelectedShapes,
  getShapeBounds,
} from "utils/utils"
import { getShapeUtils } from "lib/shape-utils"

const PI2 = Math.PI * 2

export default class RotateSession extends BaseSession {
  delta = [0, 0]
  origin: number[]
  snapshot: RotateSnapshot

  constructor(data: Data, point: number[]) {
    super(data)
    this.origin = point
    this.snapshot = getRotateSnapshot(data)
  }

  update(data: Data, point: number[], isLocked: boolean) {
    const { boundsCenter, shapes } = this.snapshot

    const page = getPage(data)
    const a1 = vec.angle(boundsCenter, this.origin)
    const a2 = vec.angle(boundsCenter, point)

    let rot = a2 - a1

    if (isLocked) {
      rot = clampToRotationToSegments(rot, 24)
    }

    data.boundsRotation = (PI2 + (this.snapshot.boundsRotation + rot)) % PI2

    for (let { id, center, offset, rotation } of shapes) {
      const shape = page.shapes[id]

      getShapeUtils(shape)
        .rotate(shape, (PI2 + (rotation + rot)) % PI2)
        .translate(
          shape,
          vec.sub(vec.rotWith(center, boundsCenter, rot % PI2), offset)
        )
    }
  }

  cancel(data: Data) {
    const page = getPage(data, this.snapshot.currentPageId)

    for (let { id, point, rotation } of this.snapshot.shapes) {
      const shape = page.shapes[id]
      getShapeUtils(shape).rotate(shape, rotation).translate(shape, point)
    }
  }

  complete(data: Data) {
    commands.rotate(data, this.snapshot, getRotateSnapshot(data))
  }
}

export function getRotateSnapshot(data: Data) {
  const shapes = getSelectedShapes(current(data))

  // A mapping of selected shapes and their bounds
  const shapesBounds = Object.fromEntries(
    shapes.map((shape) => [shape.id, getShapeBounds(shape)])
  )

  // The common (exterior) bounds of the selected shapes
  const bounds = getCommonBounds(...Object.values(shapesBounds))

  const boundsCenter = getBoundsCenter(bounds)

  return {
    boundsCenter,
    currentPageId: data.currentPageId,
    boundsRotation: data.boundsRotation,
    shapes: shapes.map(({ id, point, rotation }) => {
      const bounds = shapesBounds[id]
      const offset = [bounds.width / 2, bounds.height / 2]
      const center = getBoundsCenter(bounds)

      return {
        id,
        point,
        rotation,
        offset,
        center,
      }
    }),
  }
}

export type RotateSnapshot = ReturnType<typeof getRotateSnapshot>
