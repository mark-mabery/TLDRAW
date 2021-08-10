/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useRef } from 'react'
import { useTLContext } from './useTLContext'
import { Vec } from '../../utils'
import { useWheel, usePinch } from 'react-use-gesture'
import { inputs } from '../../inputs'

// Capture zoom gestures (pinches, wheels and pans)
export function useZoomEvents() {
  const rPinchDa = useRef<number[] | undefined>(undefined)
  const rOriginPoint = useRef<number[] | undefined>(undefined)
  const rPinchPoint = useRef<number[] | undefined>(undefined)

  const { callbacks } = useTLContext()

  useWheel(
    ({ event: e, delta }) => {
      e.preventDefault()

      if (Vec.isEqual(delta, [0, 0])) return

      const info = inputs.pan(delta, e as WheelEvent)

      callbacks.onPan?.(info, e)
    },
    {
      domTarget: typeof document === 'undefined' ? undefined : document.body,
      eventOptions: { passive: false },
    }
  )

  usePinch(
    ({ pinching, da, origin, event: e }) => {
      if (!pinching) {
        const info = inputs.pinch(origin, origin)
        callbacks.onPinchEnd?.(
          info,
          e as React.WheelEvent<Element> | WheelEvent | React.TouchEvent<Element> | TouchEvent
        )
        rPinchDa.current = undefined
        rPinchPoint.current = undefined
        rOriginPoint.current = undefined
        return
      }

      if (rPinchPoint.current === undefined) {
        const info = inputs.pinch(origin, origin)
        callbacks.onPinchStart?.(
          info,
          e as React.WheelEvent<Element> | WheelEvent | React.TouchEvent<Element> | TouchEvent
        )
        rPinchDa.current = da
        rPinchPoint.current = origin
        rOriginPoint.current = origin
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const [distanceDelta] = Vec.sub(rPinchDa.current!, da)

      const info = inputs.pinch(rPinchPoint.current, origin)

      callbacks.onPinch?.(
        {
          ...info,
          point: origin,
          origin: rOriginPoint.current!,
          delta: [...info.delta, distanceDelta],
        },
        e as React.WheelEvent<Element> | WheelEvent | React.TouchEvent<Element> | TouchEvent
      )

      rPinchDa.current = da
      rPinchPoint.current = origin
    },
    {
      domTarget: typeof document === 'undefined' ? undefined : document.body,
      eventOptions: { passive: false },
    }
  )
}
