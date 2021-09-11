import * as React from 'react'
import type { Inputs } from '+inputs'
import type { TLCallbacks, TLShape, TLBounds, TLPageState, TLShapeUtils } from '+types'

export interface TLContextType<T extends TLShape, E extends HTMLElement | SVGElement> {
  id?: string
  callbacks: Partial<TLCallbacks>
  shapeUtils: TLShapeUtils<T, E>
  rPageState: React.MutableRefObject<TLPageState>
  rScreenBounds: React.MutableRefObject<TLBounds | null>
  inputs: Inputs
}

export const TLContext = React.createContext<TLContextType<any, any>>(
  {} as TLContextType<TLShape, HTMLElement | SVGElement>
)

export function useTLContext() {
  const context = React.useContext(TLContext)

  return context
}
