import { Utils, Vec } from '@tldraw/core'
import { Data, DrawShape, Session, TLDrawStatus } from '~types'
import { TLDR } from '~state/tldr'

// TODO
// [ ] - Solve flat lines at corners on perfectly straight lines

export class DrawSession implements Session {
  id = 'draw'
  status = TLDrawStatus.Creating
  topLeft: number[]
  origin: number[]
  previous: number[]
  last: number[]
  points: number[][]
  shiftedPoints: number[][] = []
  snapshot: DrawSnapshot
  isLocked?: boolean
  lockedDirection?: 'horizontal' | 'vertical'

  constructor(data: Data, id: string, point: number[]) {
    this.origin = point
    this.previous = point
    this.last = point
    this.topLeft = point

    this.snapshot = getDrawSnapshot(data, id)

    // Add a first point but don't update the shape yet. We'll update
    // when the draw session ends; if the user hasn't added additional
    // points, this single point will be interpreted as a "dot" shape.
    this.points = []
  }

  start = () => void null

  update = (data: Data, point: number[], pressure: number, isLocked = false) => {
    const { snapshot } = this

    // Roundabout way of preventing the "dot" from showing while drawing
    if (this.points.length === 0) {
      this.points.push([0, 0, pressure])
    }

    // Drawing while holding shift will "lock" the pen to either the
    // x or y axis, depending on which direction has the greater
    // delta. Pressing shift will also add more points to "return"
    // the pen to the axis.
    if (isLocked) {
      if (!this.isLocked && this.points.length > 1) {
        const bounds = Utils.getBoundsFromPoints(this.points)
        if (bounds.width > 8 || bounds.height > 8) {
          this.isLocked = true
          const returning = [...this.last]

          const isVertical = bounds.height > 8

          if (isVertical) {
            this.lockedDirection = 'vertical'
            returning[0] = this.origin[0]
          } else {
            this.lockedDirection = 'horizontal'
            returning[1] = this.origin[1]
          }

          this.previous = returning
          this.points.push(Vec.sub(returning, this.origin))
        }
      }
    } else if (this.isLocked) {
      this.isLocked = false
    }

    if (this.isLocked) {
      if (this.lockedDirection === 'vertical') {
        point[0] = this.origin[0]
      } else {
        point[1] = this.origin[1]
      }
    }

    // The previous input (not adjusted) point

    // The new adjusted point
    const newPoint = Vec.round(Vec.sub(point, this.origin)).concat(pressure)

    // Don't add duplicate points. Be sure to
    // test against the previous *adjusted* point.
    if (Vec.isEqual(this.last, newPoint)) return

    // The new adjusted point is now the previous adjusted point.
    this.last = newPoint

    // Does the input point create a new top left?
    const prevTopLeft = [...this.topLeft]

    this.topLeft = [Math.min(this.topLeft[0], point[0]), Math.min(this.topLeft[1], point[1])]

    const delta = Vec.sub(this.topLeft, this.origin)

    // Add the new adjusted point to the points array
    this.points.push(newPoint)

    // Time to shift some points!

    let points: number[][]

    if (Vec.isEqual(prevTopLeft, this.topLeft)) {
      // If the new top left is the same as the previous top left,
      // we don't need to shift anything: we just shift the new point
      // and add it to the shifted points array.
      points = [...this.shiftedPoints, Vec.sub(newPoint, delta)]
    } else {
      // If we have a new top left, then we need to iterate through
      // the "unshifted" points array and shift them based on the
      // offset between the new top left and the original top left.
      points = this.points.map((pt) => [pt[0] - delta[0], pt[1] - delta[1], pt[2]])
    }

    this.shiftedPoints = points

    return {
      document: {
        pages: {
          [data.appState.currentPageId]: {
            shapes: {
              [snapshot.id]: {
                point: this.topLeft,
                points,
              },
            },
          },
        },
        pageStates: {
          [data.appState.currentPageId]: {
            selectedIds: [snapshot.id],
          },
        },
      },
    }
  }

  cancel = (data: Data) => {
    const { snapshot } = this
    const pageId = data.appState.currentPageId

    return {
      document: {
        pages: {
          [pageId]: {
            shapes: {
              [snapshot.id]: undefined,
            },
          },
        },
        pageStates: {
          [pageId]: {
            selectedIds: [],
          },
        },
      },
    }
  }

  complete = (data: Data) => {
    const { snapshot } = this
    const pageId = data.appState.currentPageId

    this.points.push(this.last)

    return {
      id: 'create_draw',
      before: {
        document: {
          pages: {
            [pageId]: {
              shapes: {
                [snapshot.id]: undefined,
              },
            },
          },
          pageStates: {
            [pageId]: {
              selectedIds: [],
            },
          },
        },
      },
      after: {
        document: {
          pages: {
            [pageId]: {
              shapes: {
                [snapshot.id]: TLDR.getShape(data, snapshot.id, pageId),
              },
            },
          },
          pageStates: {
            [data.appState.currentPageId]: {
              selectedIds: [],
            },
          },
        },
      },
    }
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getDrawSnapshot(data: Data, shapeId: string) {
  const page = { ...TLDR.getPage(data, data.appState.currentPageId) }

  const { points, point } = Utils.deepClone(page.shapes[shapeId]) as DrawShape

  return {
    id: shapeId,
    point,
    points,
  }
}

export type DrawSnapshot = ReturnType<typeof getDrawSnapshot>
