import React, { useCallback, useRef, memo } from 'react'
import state, { useSelector } from 'state'
import inputs from 'state/inputs'
import styled from 'styles'
import { getShapeUtils } from 'lib/shape-utils'
import { getPage } from 'utils/utils'
import { ShapeStyles } from 'types'

function Shape({ id, isSelecting }: { id: string; isSelecting: boolean }) {
  const isHovered = useSelector((state) => state.data.hoveredId === id)

  const isSelected = useSelector((state) => state.values.selectedIds.has(id))

  const shape = useSelector(({ data }) => getPage(data).shapes[id])

  const rGroup = useRef<SVGGElement>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      rGroup.current.setPointerCapture(e.pointerId)
      state.send('POINTED_SHAPE', inputs.pointerDown(e, id))
    },
    [id]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      rGroup.current.releasePointerCapture(e.pointerId)
      state.send('STOPPED_POINTING', inputs.pointerUp(e))
    },
    [id]
  )

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent) => {
      state.send('HOVERED_SHAPE', inputs.pointerEnter(e, id))
    },
    [id, shape]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      state.send('MOVED_OVER_SHAPE', inputs.pointerEnter(e, id))
    },
    [id, shape]
  )

  const handlePointerLeave = useCallback(
    () => state.send('UNHOVERED_SHAPE', { target: id }),
    [id]
  )

  // This is a problem with deleted shapes. The hooks in this component
  // may sometimes run before the hook in the Page component, which means
  // a deleted shape will still be pulled here before the page component
  // detects the change and pulls this component.
  if (!shape) return null

  return (
    <StyledGroup
      ref={rGroup}
      isHovered={isHovered}
      isSelected={isSelected}
      transform={`rotate(${shape.rotation * (180 / Math.PI)},${getShapeUtils(
        shape
      ).getCenter(shape)}) translate(${shape.point})`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      {isSelecting && <HoverIndicator as="use" href={'#' + id} />}
      <StyledShape id={id} style={shape.style} />
    </StyledGroup>
  )
}

const StyledShape = memo(
  ({ id, style }: { id: string; style: ShapeStyles }) => {
    return <MainShape as="use" href={'#' + id} {...style} />
  }
)

const MainShape = styled('use', {
  zStrokeWidth: 1,
})

const HoverIndicator = styled('path', {
  fill: 'none',
  stroke: 'transparent',
  pointerEvents: 'all',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  transform: 'all .2s',
})

const StyledGroup = styled('g', {
  [`& ${HoverIndicator}`]: {
    opacity: '0',
  },
  variants: {
    isSelected: {
      true: {},
      false: {},
    },
    isHovered: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      isSelected: true,
      isHovered: true,
      css: {
        [`& ${HoverIndicator}`]: {
          opacity: '1',
          stroke: '$hint',
          zStrokeWidth: [8, 4],
        },
      },
    },
    {
      isSelected: true,
      isHovered: false,
      css: {
        [`& ${HoverIndicator}`]: {
          opacity: '1',
          stroke: '$hint',
          zStrokeWidth: [6, 3],
        },
      },
    },
    {
      isSelected: false,
      isHovered: true,
      css: {
        [`& ${HoverIndicator}`]: {
          opacity: '1',
          stroke: '$hint',
          zStrokeWidth: [8, 4],
        },
      },
    },
  ],
})

export { HoverIndicator }

export default memo(Shape)
