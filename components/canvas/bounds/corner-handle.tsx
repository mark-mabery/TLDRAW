import useHandleEvents from 'hooks/useBoundsHandleEvents'
import styled from 'styles'
import { Corner, Bounds } from 'types'

export default function CornerHandle({
  size,
  corner,
  bounds,
}: {
  size: number
  bounds: Bounds
  corner: Corner
}) {
  const events = useHandleEvents(corner)

  const isTop = corner === Corner.TopLeft || corner === Corner.TopRight
  const isLeft = corner === Corner.TopLeft || corner === Corner.BottomLeft

  return (
    <g>
      <StyledCorner
        corner={corner}
        x={(isLeft ? 0 : bounds.width) - size}
        y={(isTop ? 0 : bounds.height) - size}
        width={size * 2}
        height={size * 2}
        {...events}
      />
      <StyledCornerInner
        x={(isLeft ? 0 : bounds.width) - size / 2}
        y={(isTop ? 0 : bounds.height) - size / 2}
        width={size}
        height={size}
        pointerEvents="none"
      />
    </g>
  )
}

const StyledCorner = styled('rect', {
  stroke: 'none',
  fill: 'transparent',
  variants: {
    corner: {
      [Corner.TopLeft]: { cursor: 'nwse-resize' },
      [Corner.TopRight]: { cursor: 'nesw-resize' },
      [Corner.BottomRight]: { cursor: 'nwse-resize' },
      [Corner.BottomLeft]: { cursor: 'nesw-resize' },
    },
  },
})

const StyledCornerInner = styled('rect', {
  stroke: '$bounds',
  fill: '#fff',
  zStrokeWidth: 2,
})
