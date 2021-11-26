import * as React from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { AlignStyle, TDShapeType } from '~types'
import { useFileSystemHandlers, useTldrawApp } from '~hooks'

export function useKeyboardShortcuts(ref: React.RefObject<HTMLDivElement>) {
  const app = useTldrawApp()

  const canHandleEvent = React.useCallback(() => {
    const elm = ref.current
    return elm && (document.activeElement === elm || elm.contains(document.activeElement))
  }, [ref])

  /* ---------------------- Tools --------------------- */

  useHotkeys(
    'v,1',
    () => {
      if (!canHandleEvent()) return
      app.selectTool('select')
    },
    [app, ref.current]
  )

  useHotkeys(
    'd,2',
    () => {
      if (!canHandleEvent()) return
      app.selectTool(TDShapeType.Draw)
    },
    undefined,
    [app]
  )

  useHotkeys(
    'e,3',
    () => {
      if (!canHandleEvent()) return
      app.selectTool('erase')
    },
    undefined,
    [app]
  )

  useHotkeys(
    'r,4',
    () => {
      if (!canHandleEvent()) return
      app.selectTool(TDShapeType.Rectangle)
    },
    undefined,
    [app]
  )

  useHotkeys(
    'i,5',
    () => {
      if (!canHandleEvent()) return
      app.selectTool(TDShapeType.Ellipse)
    },
    undefined,
    [app]
  )

  useHotkeys(
    'l,6',
    () => {
      if (!canHandleEvent()) return
      app.selectTool(TDShapeType.Line)
    },
    undefined,
    [app]
  )

  useHotkeys(
    'a,7',
    () => {
      if (!canHandleEvent()) return
      app.selectTool(TDShapeType.Arrow)
    },
    undefined,
    [app]
  )

  useHotkeys(
    't,8',
    () => {
      if (!canHandleEvent()) return
      app.selectTool(TDShapeType.Text)
    },
    undefined,
    [app]
  )

  useHotkeys(
    's,9',
    () => {
      if (!canHandleEvent()) return
      app.selectTool(TDShapeType.Sticky)
    },
    undefined,
    [app]
  )

  /* ---------------------- Misc ---------------------- */

  // Dark Mode

  useHotkeys(
    'ctrl+shift+d,⌘+shift+d',
    (e) => {
      if (!canHandleEvent()) return
      app.toggleDarkMode()
      e.preventDefault()
    },
    undefined,
    [app]
  )

  // Focus Mode

  useHotkeys(
    'ctrl+.,⌘+.',
    () => {
      if (!canHandleEvent()) return
      app.toggleFocusMode()
    },
    undefined,
    [app]
  )

  useHotkeys(
    'ctrl+shift+g,⌘+shift+g',
    () => {
      if (!canHandleEvent()) return
      app.toggleGrid()
    },
    undefined,
    [app]
  )

  // File System

  const { onNewProject, onOpenProject, onSaveProject, onSaveProjectAs } = useFileSystemHandlers()

  useHotkeys(
    'ctrl+n,⌘+n',
    (e) => {
      if (!canHandleEvent()) return

      onNewProject(e)
    },
    undefined,
    [app]
  )
  useHotkeys(
    'ctrl+s,⌘+s',
    (e) => {
      if (!canHandleEvent()) return

      onSaveProject(e)
    },
    undefined,
    [app]
  )

  useHotkeys(
    'ctrl+shift+s,⌘+shift+s',
    (e) => {
      if (!canHandleEvent()) return

      onSaveProjectAs(e)
    },
    undefined,
    [app]
  )
  useHotkeys(
    'ctrl+o,⌘+o',
    (e) => {
      if (!canHandleEvent()) return

      onOpenProject(e)
    },
    undefined,
    [app]
  )

  // Undo Redo

  useHotkeys(
    '⌘+z,ctrl+z',
    () => {
      if (!canHandleEvent()) return

      if (app.session) {
        app.cancelSession()
      } else {
        app.undo()
      }
    },
    undefined,
    [app]
  )

  useHotkeys(
    'ctrl+shift-z,⌘+shift+z',
    () => {
      if (!canHandleEvent()) return

      if (app.session) {
        app.cancelSession()
      } else {
        app.redo()
      }
    },
    undefined,
    [app]
  )

  // Undo Redo

  useHotkeys(
    '⌘+u,ctrl+u',
    () => {
      if (!canHandleEvent()) return
      app.undoSelect()
    },
    undefined,
    [app]
  )

  useHotkeys(
    'ctrl+shift-u,⌘+shift+u',
    () => {
      if (!canHandleEvent()) return
      app.redoSelect()
    },
    undefined,
    [app]
  )

  /* -------------------- Commands -------------------- */

  // Camera

  useHotkeys(
    'ctrl+=,⌘+=,ctrl+num_subtract,⌘+num_subtract',
    (e) => {
      if (!canHandleEvent()) return
      app.zoomIn()
      e.preventDefault()
    },
    undefined,
    [app]
  )

  useHotkeys(
    'ctrl+-,⌘+-,ctrl+num_add,⌘+num_add',
    (e) => {
      if (!canHandleEvent()) return

      app.zoomOut()
      e.preventDefault()
    },
    undefined,
    [app]
  )

  useHotkeys(
    'shift+0,ctrl+numpad_0,⌘+numpad_0',
    () => {
      if (!canHandleEvent()) return
      app.resetZoom()
    },
    undefined,
    [app]
  )

  useHotkeys(
    'shift+1',
    () => {
      if (!canHandleEvent()) return
      app.zoomToFit()
    },
    undefined,
    [app]
  )

  useHotkeys(
    'shift+2',
    () => {
      if (!canHandleEvent()) return
      app.zoomToSelection()
    },
    undefined,
    [app]
  )

  // Duplicate

  useHotkeys(
    'ctrl+d,⌘+d',
    (e) => {
      if (!canHandleEvent()) return

      app.duplicate()
      e.preventDefault()
    },
    undefined,
    [app]
  )

  // Flip

  useHotkeys(
    'shift+h',
    () => {
      if (!canHandleEvent()) return
      app.flipHorizontal()
    },
    undefined,
    [app]
  )

  useHotkeys(
    'shift+v',
    () => {
      if (!canHandleEvent()) return
      app.flipVertical()
    },
    undefined,
    [app]
  )

  // Cancel

  useHotkeys(
    'escape',
    () => {
      if (!canHandleEvent()) return

      app.cancel()
    },
    undefined,
    [app]
  )

  // Delete

  useHotkeys(
    'backspace,del',
    () => {
      if (!canHandleEvent()) return
      app.delete()
    },
    undefined,
    [app]
  )

  // Select All

  useHotkeys(
    '⌘+a,ctrl+a',
    () => {
      if (!canHandleEvent()) return
      app.selectAll()
    },
    undefined,
    [app]
  )

  // Nudge

  useHotkeys(
    'up',
    () => {
      if (!canHandleEvent()) return
      app.nudge([0, -1], false)
    },
    undefined,
    [app]
  )

  useHotkeys(
    'right',
    () => {
      if (!canHandleEvent()) return
      app.nudge([1, 0], false)
    },
    undefined,
    [app]
  )

  useHotkeys(
    'down',
    () => {
      if (!canHandleEvent()) return
      app.nudge([0, 1], false)
    },
    undefined,
    [app]
  )

  useHotkeys(
    'left',
    () => {
      if (!canHandleEvent()) return
      app.nudge([-1, 0], false)
    },
    undefined,
    [app]
  )

  useHotkeys(
    'shift+up',
    () => {
      if (!canHandleEvent()) return
      app.nudge([0, -1], true)
    },
    undefined,
    [app]
  )

  useHotkeys(
    'shift+right',
    () => {
      if (!canHandleEvent()) return
      app.nudge([1, 0], true)
    },
    undefined,
    [app]
  )

  useHotkeys(
    'shift+down',
    () => {
      if (!canHandleEvent()) return
      app.nudge([0, 1], true)
    },
    undefined,
    [app]
  )

  useHotkeys(
    'shift+left',
    () => {
      if (!canHandleEvent()) return
      app.nudge([-1, 0], true)
    },
    undefined,
    [app]
  )

  useHotkeys(
    '⌘+shift+l,ctrl+shift+l',
    () => {
      if (!canHandleEvent()) return
      app.toggleLocked()
    },
    undefined,
    [app]
  )

  // Copy, Cut & Paste

  useHotkeys(
    '⌘+c,ctrl+c',
    () => {
      if (!canHandleEvent()) return
      app.copy()
    },
    undefined,
    [app]
  )

  useHotkeys(
    '⌘+x,ctrl+x',
    () => {
      if (!canHandleEvent()) return
      app.cut()
    },
    undefined,
    [app]
  )

  useHotkeys(
    '⌘+v,ctrl+v',
    () => {
      if (!canHandleEvent()) return
      app.paste()
    },
    undefined,
    [app]
  )

  // Group & Ungroup

  useHotkeys(
    '⌘+g,ctrl+g',
    (e) => {
      if (!canHandleEvent()) return

      app.group()
      e.preventDefault()
    },
    undefined,
    [app]
  )

  useHotkeys(
    '⌘+shift+g,ctrl+shift+g',
    (e) => {
      if (!canHandleEvent()) return

      app.ungroup()
      e.preventDefault()
    },
    undefined,
    [app]
  )

  // Move

  useHotkeys(
    '[',
    () => {
      if (!canHandleEvent()) return
      app.moveBackward()
    },
    undefined,
    [app]
  )

  useHotkeys(
    ']',
    () => {
      if (!canHandleEvent()) return
      app.moveForward()
    },
    undefined,
    [app]
  )

  useHotkeys(
    'shift+[',
    () => {
      if (!canHandleEvent()) return
      app.moveToBack()
    },
    undefined,
    [app]
  )

  useHotkeys(
    'shift+]',
    () => {
      if (!canHandleEvent()) return
      app.moveToFront()
    },
    undefined,
    [app]
  )

  useHotkeys(
    'ctrl+shift+backspace,⌘+shift+backspace',
    (e) => {
      if (!canHandleEvent()) return
      if (app.settings.isDebugMode) {
        app.resetDocument()
      }
      e.preventDefault()
    },
    undefined,
    [app]
  )

  // Text Align

  useHotkeys(
    'alt+command+l,alt+ctrl+l',
    (e) => {
      if (!canHandleEvent()) return
      app.style({ textAlign: AlignStyle.Start })
      e.preventDefault()
    },
    undefined,
    [app]
  )

  useHotkeys(
    'alt+command+t,alt+ctrl+t',
    (e) => {
      if (!canHandleEvent()) return
      app.style({ textAlign: AlignStyle.Middle })
      e.preventDefault()
    },
    undefined,
    [app]
  )

  useHotkeys(
    'alt+command+r,alt+ctrl+r',
    (e) => {
      if (!canHandleEvent()) return
      app.style({ textAlign: AlignStyle.End })
      e.preventDefault()
    },
    undefined,
    [app]
  )
}
