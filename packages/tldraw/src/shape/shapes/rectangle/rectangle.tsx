import * as React from 'react'
import { Utils, SVGContainer, ShapeUtil } from '@tldraw/core'
import { Vec } from '@tldraw/vec'
import getStroke, { getStrokeOutlinePoints, getStrokePoints } from 'perfect-freehand'
import { getPerfectDashProps, defaultStyle, getShapeStyle } from '~shape/shape-styles'
import { RectangleShape, DashStyle, TLDrawShapeType, TLDrawMeta } from '~types'
import { getBoundsRectangle, transformRectangle, transformSingleRectangle } from '../shared'
import { EASINGS } from '~state/utils'

const pathCache = new WeakMap<number[], string>([])

export const Rectangle = new ShapeUtil<RectangleShape, SVGSVGElement, TLDrawMeta>(() => ({
  type: TLDrawShapeType.Rectangle,

  canBind: true,

  defaultProps: {
    id: 'id',
    type: TLDrawShapeType.Rectangle,
    name: 'Rectangle',
    parentId: 'page',
    childIndex: 1,
    point: [0, 0],
    size: [1, 1],
    rotation: 0,
    style: defaultStyle,
  },

  shouldRender(prev, next) {
    return next.size !== prev.size || next.style !== prev.style
  },

  Component({ shape, isBinding, meta, events }, ref) {
    const { id, size, style } = shape
    const styles = getShapeStyle(style, meta.isDarkMode)
    const strokeWidth = +styles.strokeWidth

    if (style.dash === DashStyle.Draw) {
      const pathData = Utils.getFromCache(pathCache, shape.size, () => getRectanglePath(shape))

      return (
        <SVGContainer ref={ref} id={shape.id + '_svg'} {...events}>
          {isBinding && (
            <rect
              className="tl-binding-indicator"
              x={strokeWidth / 2 - 32}
              y={strokeWidth / 2 - 32}
              width={Math.max(0, size[0] - strokeWidth / 2) + 64}
              height={Math.max(0, size[1] - strokeWidth / 2) + 64}
            />
          )}
          <path
            d={getRectangleIndicatorPathData(shape)}
            fill={style.isFilled ? styles.fill : 'none'}
            radius={strokeWidth}
            stroke="none"
            pointerEvents="all"
          />
          <path
            d={pathData}
            fill={styles.stroke}
            stroke={styles.stroke}
            strokeWidth={styles.strokeWidth}
            pointerEvents="all"
          />
        </SVGContainer>
      )
    }

    const sw = 1 + strokeWidth * 1.618

    const w = Math.max(0, size[0] - sw / 2)
    const h = Math.max(0, size[1] - sw / 2)

    const strokes: [number[], number[], number][] = [
      [[sw / 2, sw / 2], [w, sw / 2], w - sw / 2],
      [[w, sw / 2], [w, h], h - sw / 2],
      [[w, h], [sw / 2, h], w - sw / 2],
      [[sw / 2, h], [sw / 2, sw / 2], h - sw / 2],
    ]

    const paths = strokes.map(([start, end, length], i) => {
      const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(
        length,
        strokeWidth * 1.618,
        shape.style.dash
      )

      return (
        <line
          key={id + '_' + i}
          x1={start[0]}
          y1={start[1]}
          x2={end[0]}
          y2={end[1]}
          stroke={styles.stroke}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      )
    })

    return (
      <SVGContainer ref={ref} id={shape.id + '_svg'} {...events}>
        {isBinding && (
          <rect
            className="tl-binding-indicator"
            x={sw / 2 - 32}
            y={sw / 2 - 32}
            width={w + 64}
            height={h + 64}
          />
        )}
        <rect
          x={sw / 2}
          y={sw / 2}
          width={w}
          height={h}
          fill={styles.fill}
          stroke="none"
          strokeWidth={sw}
          pointerEvents="all"
        />
        <g pointerEvents="stroke">{paths}</g>
      </SVGContainer>
    )
  },

  Indicator({ shape }) {
    const {
      style,
      size: [width, height],
    } = shape

    const styles = getShapeStyle(style, false)
    const strokeWidth = +styles.strokeWidth

    const sw = strokeWidth

    if (style.dash === DashStyle.Draw) {
      return <path d={getRectangleIndicatorPathData(shape)} />
    }

    return (
      <rect
        x={sw}
        y={sw}
        rx={1}
        ry={1}
        width={Math.max(1, width - sw * 2)}
        height={Math.max(1, height - sw * 2)}
      />
    )
  },

  getBounds(shape) {
    return getBoundsRectangle(shape, this.boundsCache)
  },

  transform: transformRectangle,

  transformSingle: transformSingleRectangle,
}))

/* -------------------------------------------------- */
/*                       Helpers                      */
/* -------------------------------------------------- */

function getRectangleDrawPoints(shape: RectangleShape) {
  const styles = getShapeStyle(shape.style)

  const getRandom = Utils.rng(shape.id)

  const sw = styles.strokeWidth

  // Dimensions
  const w = Math.max(0, shape.size[0])
  const h = Math.max(0, shape.size[1])

  // Random corner offsets
  const offsets = Array.from(Array(4)).map(() => {
    return [getRandom() * sw * 0.75, getRandom() * sw * 0.75]
  })

  // Corners
  const tl = Vec.add([sw / 2, sw / 2], offsets[0])
  const tr = Vec.add([w - sw / 2, sw / 2], offsets[1])
  const br = Vec.add([w - sw / 2, h - sw / 2], offsets[2])
  const bl = Vec.add([sw / 2, h - sw / 2], offsets[3])

  // Which side to start drawing first
  const rm = Math.round(Math.abs(getRandom() * 2 * 4))

  // Corner radii
  const rx = Math.min(w / 2, sw * 2)
  const ry = Math.min(h / 2, sw * 2)

  // Number of points per side
  const px = Math.max(8, Math.floor(w / 16))
  const py = Math.max(8, Math.floor(h / 16))

  // Inset each line by the corner radii and let the freehand algo
  // interpolate points for the corners.
  const lines = Utils.rotateArray(
    [
      Vec.pointsBetween(Vec.add(tl, [rx, 0]), Vec.sub(tr, [rx, 0]), px),
      Vec.pointsBetween(Vec.add(tr, [0, ry]), Vec.sub(br, [0, ry]), py),
      Vec.pointsBetween(Vec.sub(br, [rx, 0]), Vec.add(bl, [rx, 0]), px),
      Vec.pointsBetween(Vec.sub(bl, [0, ry]), Vec.add(tl, [0, ry]), py),
    ],
    rm
  )

  // For the final points, include the first half of the first line again,
  // so that the line wraps around and avoids ending on a sharp corner.
  // This has a bit of finesse and magic—if you change the points between
  // function, then you'll likely need to change this one too.

  const points = [...lines.flat(), ...lines[0]].slice(
    5,
    Math.floor((rm % 2 === 0 ? px : py) / -2) + 3
  )

  return {
    points,
  }
}

function getDrawStrokeInfo(shape: RectangleShape) {
  const { points } = getRectangleDrawPoints(shape)

  const { strokeWidth } = getShapeStyle(shape.style)

  const options = {
    size: strokeWidth,
    thinning: 0.65,
    streamline: 0.3,
    smoothing: 1,
    simulatePressure: false,
    last: true,
  }

  return { points, options }
}

function getRectanglePath(shape: RectangleShape) {
  const { points, options } = getDrawStrokeInfo(shape)

  const stroke = getStroke(points, options)

  return Utils.getSvgPathFromStroke(stroke)
}

function getRectangleIndicatorPathData(shape: RectangleShape) {
  const { points, options } = getDrawStrokeInfo(shape)

  const strokePoints = getStrokePoints(points, options)

  return Utils.getSvgPathFromStroke(
    strokePoints.map((pt) => pt.point.slice(0, 2)),
    false
  )
}
