import { v4 as uuid } from "uuid"
import * as vec from "utils/vec"
import { EllipseShape, ShapeType } from "types"
import { createShape } from "./index"
import { boundsContained } from "utils/bounds"
import { intersectEllipseBounds } from "utils/intersections"
import { pointInEllipse } from "utils/hitTests"
import { translateBounds } from "utils/utils"

const ellipse = createShape<EllipseShape>({
  boundsCache: new WeakMap([]),

  create(props) {
    return {
      id: uuid(),
      type: ShapeType.Ellipse,
      isGenerated: false,
      name: "Ellipse",
      parentId: "page0",
      childIndex: 0,
      point: [0, 0],
      radiusX: 20,
      radiusY: 20,
      rotation: 0,
      style: {
        fill: "rgba(142, 143, 142, 1.000)",
        stroke: "#000",
      },
      ...props,
    }
  },

  render({ id, radiusX, radiusY }) {
    return (
      <ellipse id={id} cx={radiusX} cy={radiusY} rx={radiusX} ry={radiusY} />
    )
  },

  getBounds(shape) {
    if (!this.boundsCache.has(shape)) {
      const { radiusX, radiusY } = shape

      const bounds = {
        minX: 0,
        maxX: radiusX * 2,
        minY: 0,
        maxY: radiusY * 2,
        width: radiusX * 2,
        height: radiusY * 2,
      }

      this.boundsCache.set(shape, bounds)
    }

    return translateBounds(this.boundsCache.get(shape), shape.point)
  },

  getRotatedBounds(shape) {
    return this.getBounds(shape)
  },

  getCenter(shape) {
    return [shape.point[0] + shape.radiusX, shape.point[1] + shape.radiusY]
  },

  hitTest(shape, point) {
    return pointInEllipse(
      point,
      vec.add(shape.point, [shape.radiusX, shape.radiusY]),
      shape.radiusX,
      shape.radiusY
    )
  },

  hitTestBounds(this, shape, brushBounds) {
    const shapeBounds = this.getBounds(shape)

    return (
      boundsContained(shapeBounds, brushBounds) ||
      intersectEllipseBounds(
        vec.add(shape.point, [shape.radiusX, shape.radiusY]),
        shape.radiusX,
        shape.radiusY,
        brushBounds
      ).length > 0
    )
  },

  rotate(shape) {
    return shape
  },

  translate(shape, delta) {
    shape.point = vec.add(shape.point, delta)
    return shape
  },

  scale(shape, scale: number) {
    return shape
  },

  transform(shape, bounds) {
    shape.point = [bounds.minX, bounds.minY]
    shape.radiusX = bounds.width / 2
    shape.radiusY = bounds.height / 2

    return shape
  },

  canTransform: true,
})

export default ellipse
