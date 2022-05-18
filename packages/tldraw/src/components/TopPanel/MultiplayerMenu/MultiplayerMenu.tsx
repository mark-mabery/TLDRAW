import * as React from 'react'
import { CheckIcon, ClipboardIcon, CursorArrowIcon } from '@radix-ui/react-icons'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useTldrawApp } from '~hooks'
import { DMItem, DMContent, DMDivider, DMTriggerIcon } from '~components/Primitives/DropdownMenu'
import { SmallIcon } from '~components/Primitives/SmallIcon'
import { MultiplayerIcon } from '~components/Primitives/icons'
import { TDAssetType, TDSnapshot } from '~types'
import { TLDR } from '~state/TLDR'
import { Utils } from '@tldraw/core'

const roomSelector = (state: TDSnapshot) => state.room

export const MultiplayerMenu = React.memo(function MultiplayerMenu() {
  const app = useTldrawApp()

  const room = app.useStore(roomSelector)

  const [copied, setCopied] = React.useState(false)

  const handleCopySelect = React.useCallback(() => {
    setCopied(true)
    TLDR.copyStringToClipboard(window.location.href)
    setTimeout(() => setCopied(false), 1200)
  }, [])

  const handleCreateMultiplayerRoom = React.useCallback(async () => {
    if (app.isDirty) {
      if (app.fileSystemHandle) {
        if (window.confirm('Do you want to save changes to your current project?')) {
          await app.saveProject()
        }
      } else {
        if (window.confirm('Do you want to save your current project?')) {
          await app.saveProject()
        }
      }
    } else if (!app.fileSystemHandle) {
      if (window.confirm('Do you want to save your current project?')) {
        await app.saveProject()
      }
    }
  }, [])

  const handleCopyToMultiplayerRoom = React.useCallback(async () => {
    const nextDocument = { ...app.document }

    if (app.callbacks.onAssetUpload) {
      for (const id in nextDocument.assets) {
        const asset = nextDocument.assets[id]
        if (asset.src.includes('base64')) {
          const file = dataURLtoFile(
            asset.src,
            asset.fileName ?? asset.type === TDAssetType.Video ? 'image.png' : 'image.mp4'
          )
          const newSrc = await app.callbacks.onAssetUpload(app, file, id)
          if (newSrc) {
            asset.src = newSrc
          } else {
            asset.src = ''
          }
        }
      }
    }

    const body = JSON.stringify({
      roomId: Utils.uniqueId(),
      pageId: app.currentPageId,
      document: app.document,
    })

    const myHeaders = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    })

    const res = await fetch(`/api/create`, {
      headers: myHeaders,
      method: 'POST',
      mode: 'no-cors',
      body,
    }).then((res) => res.json())

    if (res?.roomId) {
      window.location.href = `/r/${res.roomId}`
    }
  }, [])

  return (
    <DropdownMenu.Root dir="ltr">
      <DMTriggerIcon id="TD-MultiplayerMenuIcon">
        {room ? <MultiplayerIcon /> : <CursorArrowIcon />}
      </DMTriggerIcon>
      <DMContent variant="menu" align="start" id="TD-MultiplayerMenu">
        <DMItem id="TD-Multiplayer-CopyInviteLink" onClick={handleCopySelect} disabled={!room}>
          Copy Invite Link<SmallIcon>{copied ? <CheckIcon /> : <ClipboardIcon />}</SmallIcon>
        </DMItem>
        <DMDivider id="TD-Multiplayer-CopyInviteLinkDivider" />
        <DMItem id="TD-Multiplayer-CreateMultiplayerRoom" onClick={handleCreateMultiplayerRoom}>
          <a href="https://tldraw.com/r">Create a Multiplayer Project</a>
        </DMItem>
        <DMItem id="TD-Multiplayer-CopyToMultiplayerRoom" onClick={handleCopyToMultiplayerRoom}>
          Copy to Multiplayer Room
        </DMItem>
      </DMContent>
    </DropdownMenu.Root>
  )
})

function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(',')
  const mime = arr[0]?.match(/:(.*?);/)?.[1]
  const bstr = window.atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}
