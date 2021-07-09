import React from 'react'
import { useSelector } from 'state'
import tld from 'utils/tld'
import { DotCircle, Handle } from './misc'
import styled from 'styles'

export default function Defs(): JSX.Element {
  return (
    <defs>
      <DotCircle id="dot" r={4} />
      <Handle id="handle" r={4} />
      <ExpandDef />
      <HoverDef />
    </defs>
  )
}

function ExpandDef() {
  const zoom = useSelector((s) => tld.getCurrentCamera(s.data).zoom)
  return (
    <filter id="expand">
      <feMorphology operator="dilate" radius={0.5 / zoom} />
    </filter>
  )
}

function HoverDef() {
  return (
    <filter id="hover">
      <StyledShadow
        dx="2"
        dy="2"
        stdDeviation="0.5"
        floodOpacity="1"
        floodColor="blue"
      />
    </filter>
  )
}

const StyledShadow = styled('feDropShadow', {
  floodColor: '$selected',
})
