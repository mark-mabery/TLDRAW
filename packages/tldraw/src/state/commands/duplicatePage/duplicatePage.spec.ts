import { TLDrawState } from '~state'
import { mockDocument } from '~test'

describe('Duplicate page command', () => {
  const state = new TLDrawState()

  it('does, undoes and redoes command', () => {
    state.loadDocument(mockDocument)

    const initialId = state.page.id

    state.duplicatePage(state.currentPageId)

    const nextId = state.page.id

    state.undo()

    expect(state.page.id).toBe(initialId)

    state.redo()

    expect(state.page.id).toBe(nextId)
  })
})
