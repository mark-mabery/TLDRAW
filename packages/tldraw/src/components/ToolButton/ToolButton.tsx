import * as React from 'react'
import { Tooltip } from '~components/Tooltip'
import styled from '~styles'

export interface ToolButtonProps {
  onSelect?: () => void
  onDoubleClick?: () => void
  isActive?: boolean
  variant?: 'icon' | 'text' | 'circle' | 'primary'
  children: React.ReactNode
}

export const ToolButton = React.forwardRef<HTMLButtonElement, ToolButtonProps>(
  ({ onSelect, onDoubleClick, isActive = false, variant, children, ...rest }, ref) => {
    return (
      <StyledToolButton
        ref={ref}
        isActive={isActive}
        variant={variant}
        onPointerDown={onSelect}
        onDoubleClick={onDoubleClick}
        {...rest}
      >
        <StyledToolButtonInner isActive={isActive} variant={variant}>
          {children}
        </StyledToolButtonInner>
      </StyledToolButton>
    )
  }
)

/* ------------------ With Tooltip ------------------ */

interface ToolButtonWithTooltipProps extends ToolButtonProps {
  label: string
  kbd?: string
}

export function ToolButtonWithTooltip({ label, kbd, ...rest }: ToolButtonWithTooltipProps) {
  return (
    <Tooltip label={label[0].toUpperCase() + label.slice(1)} kbd={kbd}>
      <ToolButton variant="primary" {...rest} />
    </Tooltip>
  )
}

export const StyledToolButtonInner = styled('div', {
  position: 'relative',
  height: '100%',
  width: '100%',
  color: '$text',
  backgroundColor: '$panel',
  borderRadius: '$2',
  margin: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '$ui',
  userSelect: 'none',
  boxSizing: 'border-box',
  border: '1px solid transparent',

  variants: {
    variant: {
      primary: {
        '& svg': {
          width: 20,
          height: 20,
        },
      },
      icon: {
        display: 'grid',
        '& > *': {
          gridRow: 1,
          gridColumn: 1,
        },
      },
      text: {
        fontSize: '$1',
        padding: '0 $3',
      },
      circle: {
        borderRadius: '100%',
        boxShadow: '$panel',
      },
    },
    isActive: {
      true: {
        backgroundColor: '$selected',
        color: '$panelActive',
      },
    },
  },
})

export const StyledToolButton = styled('button', {
  position: 'relative',
  color: '$text',
  height: '48px',
  width: '40px',
  fontSize: '$0',
  background: 'none',
  margin: '0',
  padding: '$3 $2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  outline: 'none',
  cursor: 'pointer',
  pointerEvents: 'all',
  border: 'none',

  variants: {
    variant: {
      primary: {},
      icon: {},
      text: {
        width: 'auto',
      },
      circle: {},
    },
    isActive: {
      true: {},
      false: {
        [`&:hover:not(:disabled) ${StyledToolButtonInner}`]: {
          backgroundColor: '$hover',
          border: '1px solid $panel',
        },
      },
    },
  },
})
