import * as _Tooltip from '@radix-ui/react-tooltip'
import React from 'react'
import styled from 'styles'

interface TooltipProps {
  children: React.ReactNode
  label: string
  kbd?: string
  side?: 'bottom' | 'left' | 'right' | 'top'
}

export default function Tooltip({
  children,
  label,
  kbd,
  side = 'top',
}: TooltipProps): JSX.Element {
  return (
    <_Tooltip.Root>
      <_Tooltip.Trigger as="span">{children}</_Tooltip.Trigger>
      <StyledContent side={side} sideOffset={8}>
        {label}
        {kbd ? (
          <kbd>
            {kbd.split('').map((k, i) => (
              <span key={i}>{k}</span>
            ))}
          </kbd>
        ) : null}
        <StyledArrow />
      </StyledContent>
    </_Tooltip.Root>
  )
}

const StyledContent = styled(_Tooltip.Content, {
  borderRadius: 3,
  padding: '$3 $3 $3 $3',
  fontSize: '$1',
  backgroundColor: '$tooltipBg',
  color: '$tooltipText',
  boxShadow: '$3',
  display: 'flex',
  alignItems: 'center',

  '& kbd': {
    marginLeft: '$3',
    textShadow: '$2',
    textAlign: 'center',
    fontSize: '$1',
    fontFamily: '$ui',
    fontWeight: 400,
    gap: '$1',
    display: 'flex',
    alignItems: 'center',

    '& > span': {
      padding: '$0',
      borderRadius: '$0',
      background: '$overlayContrast',
      boxShadow: '$key',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
})

const StyledArrow = styled(_Tooltip.Arrow, {
  fill: '$tooltipBg',
  margin: '0 8px',
})
