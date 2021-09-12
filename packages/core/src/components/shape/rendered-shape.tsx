/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as React from 'react'
import type { TLShapeUtil, TLRenderInfo, TLShape } from '+types'

export const RenderedShape = React.memo(
  <T extends TLShape, E extends Element, M extends Record<string, unknown>>({
    shape,
    utils,
    isEditing,
    isBinding,
    isHovered,
    isSelected,
    isCurrentParent,
    onShapeChange,
    onShapeBlur,
    events,
    meta,
  }: TLRenderInfo<T, M, E> & {
    shape: T
    utils: TLShapeUtil<T, E>
  }) => {
    const ref = utils.getRef(shape)

    return (
      <utils.render
        ref={ref}
        shape={shape}
        isEditing={isEditing}
        isBinding={isBinding}
        isHovered={isHovered}
        isSelected={isSelected}
        isCurrentParent={isCurrentParent}
        meta={meta}
        events={events}
        onShapeChange={onShapeChange}
        onShapeBlur={onShapeBlur}
      />
    )
  },
  (prev, next) => {
    // If these have changed, then definitely render
    if (
      prev.isHovered !== next.isHovered ||
      prev.isSelected !== next.isSelected ||
      prev.isEditing !== next.isEditing ||
      prev.isBinding !== next.isBinding ||
      prev.meta !== next.meta ||
      prev.isCurrentParent !== next.isCurrentParent
    ) {
      return false
    }

    // If not, and if the shape has changed, ask the shape's class
    // whether it should render
    if (next.shape !== prev.shape) {
      return !next.utils.shouldRender(next.shape, prev.shape)
    }

    return true
  }
)
