import { useStateDesigner } from '@state-designer/react'
import state from 'state'
import { useCoopSelector } from 'state/coop/coop-state'
import styled from 'styles'

const size: any = { '@sm': 'small' }

export default function StatusBar(): JSX.Element {
  const local = useStateDesigner(state)
  const status = useCoopSelector((s) => s.data.status)
  const others = useCoopSelector((s) => s.data.others)

  const active = local.active.slice(1).map((s) => {
    const states = s.split('.')
    return states[states.length - 1]
  })

  const log = local.log[0]

  return (
    <StatusBarContainer size={size}>
      <Section>
        {active.join(' | ')} | {log} | {status} (
        {Object.values(others).length || 0})
      </Section>
    </StatusBarContainer>
  )
}

const StatusBarContainer = styled('div', {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  zIndex: 300,
  height: 40,
  userSelect: 'none',
  borderTop: '1px solid black',
  gridArea: 'status',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  backgroundColor: 'white',
  gap: 8,
  fontSize: '$0',
  padding: '0 16px',

  variants: {
    size: {
      small: {
        fontSize: '$1',
      },
    },
  },
})

const Section = styled('div', {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
})
