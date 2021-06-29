import { Data } from 'types'
import vec from 'utils/vec'
import BaseSession from './base-session'
import commands from 'state/commands'
import tld from 'utils/tld'
import { getShapeUtils } from 'state/shape-utils'
import { deepClone } from 'utils'

export default class HandleSession extends BaseSession {
  delta = [0, 0]
  origin: number[]
  snapshot: HandleSnapshot

  constructor(data: Data, shapeId: string, handleId: string, point: number[]) {
    super(data)
    this.origin = point
    this.snapshot = getHandleSnapshot(data, shapeId, handleId)
  }

  update(data: Data, point: number[], isAligned: boolean): void {
    const { handleId, initialShape } = this.snapshot
    const shape = tld.getPage(data).shapes[initialShape.id]

    const delta = vec.vec(this.origin, point)

    if (isAligned) {
      if (Math.abs(delta[0]) < Math.abs(delta[1])) {
        delta[0] = 0
      } else {
        delta[1] = 0
      }
    }

    const handles = initialShape.handles

    // rotate the delta ?
    // rotate the handle ?
    // rotate the shape around the previous center point

    getShapeUtils(shape).onHandleChange(shape, {
      [handleId]: {
        ...handles[handleId],
        point: vec.add(handles[handleId].point, delta), // vec.rot(delta, shape.rotation)),
      },
    })
  }

  cancel(data: Data): void {
    const { initialShape } = this.snapshot
    tld.getPage(data).shapes[initialShape.id] = initialShape
  }

  complete(data: Data): void {
    commands.handle(
      data,
      this.snapshot,
      getHandleSnapshot(
        data,
        this.snapshot.initialShape.id,
        this.snapshot.handleId
      )
    )
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getHandleSnapshot(
  data: Data,
  shapeId: string,
  handleId: string
) {
  const initialShape = deepClone(tld.getShape(data, shapeId))

  return {
    currentPageId: data.currentPageId,
    handleId,
    initialShape,
  }
}

export type HandleSnapshot = ReturnType<typeof getHandleSnapshot>
