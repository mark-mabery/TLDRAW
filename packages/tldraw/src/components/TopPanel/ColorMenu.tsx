import * as React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { strokes } from '~shape-utils'
import { useTheme, useTLDrawContext } from '~hooks'
import type { Data, ColorStyle } from '~types'
import CircleIcon from '~components/icons/CircleIcon'
import { DMContent, DMRadioItem, DMTriggerIcon } from '~components/DropdownMenu'
import { BoxIcon } from '~components/icons'
import { IconButton } from '~components/IconButton'
import { ToolButton } from '~components/ToolButton'
import { Tooltip } from '~components/Tooltip'

const selectColor = (s: Data) => s.appState.selectedStyle.color

export const ColorMenu = React.memo((): JSX.Element => {
  const { theme } = useTheme()
  const { tlstate, useSelector } = useTLDrawContext()

  const color = useSelector(selectColor)

  return (
    <DropdownMenu.Root dir="ltr">
      <DMTriggerIcon>
        <CircleIcon size={16} fill={strokes[theme][color]} stroke={strokes[theme][color]} />
      </DMTriggerIcon>
      <DMContent variant="grid">
        {Object.keys(strokes[theme]).map((colorStyle: string) => (
          <ToolButton
            key={colorStyle}
            variant="icon"
            isActive={color === colorStyle}
            onSelect={() => tlstate.style({ color: colorStyle as ColorStyle })}
          >
            <BoxIcon
              fill={strokes[theme][colorStyle as ColorStyle]}
              stroke={strokes[theme][colorStyle as ColorStyle]}
            />
          </ToolButton>
        ))}
      </DMContent>
    </DropdownMenu.Root>
  )
})
