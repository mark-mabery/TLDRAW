import { TLDR } from '~state/tldr'
import type { Data, TLDrawCommand } from '~types'
import { removeShapesFromPage } from '../utils/removeShapesFromPage'

// - [ ] Update parents and possibly delete parents

export function deleteShapes(
  data: Data,
  ids: string[],
  pageId = data.appState.currentPageId
): TLDrawCommand {
  const { before, after } = removeShapesFromPage(data, ids, pageId)

  return {
    id: 'delete',
    before: {
      document: {
        pages: {
          [pageId]: before,
        },
        pageStates: {
          [pageId]: { selectedIds: TLDR.getSelectedIds(data, pageId) },
        },
      },
    },
    after: {
      document: {
        pages: {
          [pageId]: after,
        },
        pageStates: {
          [pageId]: { selectedIds: [] },
        },
      },
    },
  }
}
