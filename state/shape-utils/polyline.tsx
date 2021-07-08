import { getFromCache, uniqueId } from 'utils/utils'
import vec from 'utils/vec'
import { PolylineShape, ShapeType } from 'types'
import { intersectPolylineBounds } from 'utils/intersections'
import {
  boundsContainPolygon,
  getBoundsFromPoints,
  translateBounds,
} from 'utils'
import { defaultStyle, getShapeStyle } from 'state/shape-styles'
import { registerShapeUtils } from './register'

const polyline = registerShapeUtils<PolylineShape>({
  boundsCache: new WeakMap([]),

  defaultProps: {
    id: uniqueId(),
    type: ShapeType.Polyline,
    name: 'Polyline',
    parentId: 'page1',
    childIndex: 0,
    point: [0, 0],
    points: [[0, 0]],
    rotation: 0,
    style: defaultStyle,
  },

  shouldRender(shape, prev) {
    return shape.points !== prev.points || shape.style !== prev.style
  },
  render(shape) {
    const { id, points } = shape

    const styles = getShapeStyle(shape.style)

    return (
      <polyline
        id={id}
        points={points.toString()}
        stroke={styles.stroke}
        strokeWidth={styles.strokeWidth}
        fill={shape.style.isFilled ? styles.fill : 'none'}
      />
    )
  },

  getBounds(shape) {
    const bounds = getFromCache(this.boundsCache, shape, (cache) => {
      cache.set(shape, getBoundsFromPoints(shape.points))
    })

    return translateBounds(bounds, shape.point)
  },

  getRotatedBounds(shape) {
    return this.getBounds(shape)
  },

  getCenter(shape) {
    const bounds = this.getBounds(shape)
    return [bounds.minX + bounds.width / 2, bounds.minY + bounds.height / 2]
  },

  hitTest(shape, point) {
    const pt = vec.sub(point, shape.point)
    let prev = shape.points[0]

    for (let i = 1; i < shape.points.length; i++) {
      const curr = shape.points[i]
      if (vec.distanceToLineSegment(prev, curr, pt) < 4) {
        return true
      }
      prev = curr
    }

    return false
  },

  hitTestBounds(this, shape, brushBounds) {
    const b = this.getBounds(shape)
    const center = [b.minX + b.width / 2, b.minY + b.height / 2]

    const rotatedCorners = [
      [b.minX, b.minY],
      [b.maxX, b.minY],
      [b.maxX, b.maxY],
      [b.minX, b.maxY],
    ].map((point) => vec.rotWith(point, center, shape.rotation))

    return (
      boundsContainPolygon(brushBounds, rotatedCorners) ||
      intersectPolylineBounds(
        shape.points.map((point) => vec.add(point, shape.point)),
        brushBounds
      ).length > 0
    )
  },

  transform(shape, bounds, { initialShape, scaleX, scaleY }) {
    const initialShapeBounds = this.getBounds(initialShape)

    shape.points = shape.points.map((_, i) => {
      const [x, y] = initialShape.points[i]

      return [
        bounds.width *
          (scaleX < 0
            ? 1 - x / initialShapeBounds.width
            : x / initialShapeBounds.width),
        bounds.height *
          (scaleY < 0
            ? 1 - y / initialShapeBounds.height
            : y / initialShapeBounds.height),
      ]
    })

    shape.point = [bounds.minX, bounds.minY]
    return this
  },

  transformSingle(shape, bounds, info) {
    this.transform(shape, bounds, info)
    return this
  },

  canTransform: true,
  canChangeAspectRatio: true,
  canStyleFill: false,
})

export default polyline
