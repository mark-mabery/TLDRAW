import styled from 'styles'
import state, { useSelector } from 'state'
import * as Panel from 'components/panel'
import { useRef } from 'react'
import { IconButton } from 'components/shared'
import { Circle, Copy, Lock, Trash, Unlock, X } from 'react-feather'
import {
  deepCompare,
  deepCompareArrays,
  getPage,
  getSelectedShapes,
} from 'utils/utils'
import { shades, fills, strokes } from 'lib/colors'

import ColorPicker from './color-picker'
import AlignDistribute from './align-distribute'
import { ShapeStyles } from 'types'
import WidthPicker from './width-picker'
import {
  AspectRatioIcon,
  BoxIcon,
  CopyIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  LockClosedIcon,
  LockOpen1Icon,
  RotateCounterClockwiseIcon,
  TrashIcon,
} from '@radix-ui/react-icons'

const fillColors = { ...shades, ...fills }
const strokeColors = { ...shades, ...strokes }

export default function StylePanel() {
  const rContainer = useRef<HTMLDivElement>(null)
  const isOpen = useSelector((s) => s.data.settings.isStyleOpen)

  return (
    <StylePanelRoot ref={rContainer} isOpen={isOpen}>
      {isOpen ? (
        <SelectedShapeStyles />
      ) : (
        <IconButton onClick={() => state.send('TOGGLED_STYLE_PANEL_OPEN')}>
          <Circle />
        </IconButton>
      )}
    </StylePanelRoot>
  )
}

// This panel is going to be hard to keep cool, as we're selecting computed
// information, based on the user's current selection. We might have to keep
// track of this data manually within our state.

function SelectedShapeStyles({}: {}) {
  const selectedIds = useSelector(
    (s) => Array.from(s.data.selectedIds.values()),
    deepCompareArrays
  )

  const isAllLocked = useSelector((s) => {
    const page = getPage(s.data)
    return selectedIds.every((id) => page.shapes[id].isLocked)
  })

  const isAllAspectLocked = useSelector((s) => {
    const page = getPage(s.data)
    return selectedIds.every((id) => page.shapes[id].isAspectRatioLocked)
  })

  const isAllHidden = useSelector((s) => {
    const page = getPage(s.data)
    return selectedIds.every((id) => page.shapes[id].isHidden)
  })

  const commonStyle = useSelector((s) => {
    const { currentStyle } = s.data

    if (selectedIds.length === 0) {
      return currentStyle
    }
    const page = getPage(s.data)
    const shapeStyles = selectedIds.map((id) => page.shapes[id].style)

    const commonStyle: Partial<ShapeStyles> = {}
    const overrides = new Set<string>([])

    for (const shapeStyle of shapeStyles) {
      for (let key in currentStyle) {
        if (overrides.has(key)) continue
        if (commonStyle[key] === undefined) {
          commonStyle[key] = shapeStyle[key]
        } else {
          if (commonStyle[key] === shapeStyle[key]) continue
          commonStyle[key] = currentStyle[key]
          overrides.add(key)
        }
      }
    }

    return commonStyle
  }, deepCompare)

  const hasSelection = selectedIds.length > 0

  return (
    <Panel.Layout>
      <Panel.Header side="right">
        <h3>Style</h3>
        <IconButton onClick={() => state.send('TOGGLED_STYLE_PANEL_OPEN')}>
          <X />
        </IconButton>
      </Panel.Header>
      <Content>
        <ColorPicker
          label="Fill"
          color={commonStyle.fill}
          colors={fillColors}
          onChange={(color) => state.send('CHANGED_STYLE', { fill: color })}
        />
        <ColorPicker
          label="Stroke"
          color={commonStyle.stroke}
          colors={strokeColors}
          onChange={(color) => state.send('CHANGED_STYLE', { stroke: color })}
        />
        <Row>
          <label htmlFor="width">Width</label>
          <WidthPicker strokeWidth={Number(commonStyle.strokeWidth)} />
        </Row>
        <AlignDistribute
          hasTwoOrMore={selectedIds.length > 1}
          hasThreeOrMore={selectedIds.length > 2}
        />
        <ButtonsRow>
          <IconButton
            disabled={!hasSelection}
            onClick={() => state.send('DUPLICATED')}
          >
            <CopyIcon />
          </IconButton>
          <IconButton
            disabled={!hasSelection}
            onClick={() => state.send('ROTATED_CCW')}
          >
            <RotateCounterClockwiseIcon />
          </IconButton>
          <IconButton
            disabled={!hasSelection}
            onClick={() => state.send('DELETED')}
          >
            <TrashIcon />
          </IconButton>
          <IconButton
            disabled={!hasSelection}
            onClick={() => state.send('TOGGLED_SHAPE_HIDE')}
          >
            {isAllHidden ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </IconButton>
          <IconButton
            disabled={!hasSelection}
            onClick={() => state.send('TOGGLED_SHAPE_LOCK')}
          >
            {isAllLocked ? <LockClosedIcon /> : <LockOpen1Icon />}
          </IconButton>
          <IconButton
            disabled={!hasSelection}
            onClick={() => state.send('TOGGLED_SHAPE_ASPECT_LOCK')}
          >
            {isAllAspectLocked ? <AspectRatioIcon /> : <BoxIcon />}
          </IconButton>
        </ButtonsRow>
      </Content>
    </Panel.Layout>
  )
}

const StylePanelRoot = styled(Panel.Root, {
  minWidth: 1,
  width: 184,
  maxWidth: 184,
  overflow: 'hidden',
  position: 'relative',

  variants: {
    isOpen: {
      true: {},
      false: {
        height: 34,
        width: 34,
      },
    },
  },
})

const Content = styled(Panel.Content, {
  padding: 8,
})

const Row = styled('div', {
  position: 'relative',
  display: 'flex',
  width: '100%',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  outline: 'none',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '4px 2px 4px 12px',

  '& label': {
    fontFamily: '$ui',
    fontSize: '$2',
    fontWeight: '$1',
    margin: 0,
    padding: 0,
  },

  '& > svg': {
    position: 'relative',
  },
})

const ButtonsRow = styled('div', {
  position: 'relative',
  display: 'flex',
  width: '100%',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  outline: 'none',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: 4,
})
