import { MutableRefObject, useCallback } from 'react'
import state from 'state'
import inputs from 'state/inputs'

export default function useHandleEvents(
  id: string,
  rGroup: MutableRefObject<SVGElement>
) {
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!inputs.canAccept(e.pointerId)) return
      e.stopPropagation()
      rGroup.current.setPointerCapture(e.pointerId)
      state.send('POINTED_HANDLE', inputs.pointerDown(e, id))
    },
    [id]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!inputs.canAccept(e.pointerId)) return
      e.stopPropagation()
      rGroup.current.releasePointerCapture(e.pointerId)
      state.send('STOPPED_POINTING', inputs.pointerUp(e))
    },
    [id]
  )

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent) => {
      if (!inputs.canAccept(e.pointerId)) return
      state.send('HOVERED_HANDLE', inputs.pointerEnter(e, id))
    },
    [id]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!inputs.canAccept(e.pointerId)) return
      state.send('MOVED_OVER_HANDLE', inputs.pointerEnter(e, id))
    },
    [id]
  )

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent) => {
      if (!inputs.canAccept(e.pointerId)) return
      state.send('UNHOVERED_HANDLE', { target: id })
    },
    [id]
  )

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerEnter: handlePointerEnter,
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
  }
}
