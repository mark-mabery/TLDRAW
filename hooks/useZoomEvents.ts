import React, { useEffect, useRef } from "react"
import state from "state"
import inputs from "state/inputs"
import * as vec from "utils/vec"

/**
 * Capture zoom gestures (pinches, wheels and pans) and send to the state.
 * @param ref
 * @returns
 */
export default function useZoomEvents(
  ref: React.MutableRefObject<SVGSVGElement>
) {
  const rTouchDist = useRef(0)

  useEffect(() => {
    const element = ref.current

    if (!element) return

    function handleWheel(e: WheelEvent) {
      e.preventDefault()

      if (e.ctrlKey) {
        state.send("ZOOMED_CAMERA", {
          delta: e.deltaY,
          ...inputs.wheel(e),
        })
        return
      }

      state.send("PANNED_CAMERA", {
        delta: [e.deltaX, e.deltaY],
        ...inputs.wheel(e),
      })
    }

    function handleTouchMove(e: TouchEvent) {
      e.preventDefault()

      if (e.touches.length === 2) {
        const { clientX: x0, clientY: y0 } = e.touches[0]
        const { clientX: x1, clientY: y1 } = e.touches[1]

        const dist = vec.dist([x0, y0], [x1, y1])
        const point = vec.med([x0, y0], [x1, y1])

        state.send("WHEELED", {
          delta: dist - rTouchDist.current,
          point,
        })

        rTouchDist.current = dist
      }
    }

    element.addEventListener("wheel", handleWheel)
    element.addEventListener("touchstart", handleTouchMove)
    element.addEventListener("touchmove", handleTouchMove)

    return () => {
      element.removeEventListener("wheel", handleWheel)
      element.removeEventListener("touchstart", handleTouchMove)
      element.removeEventListener("touchmove", handleTouchMove)
    }
  }, [ref])

  return {}
}
