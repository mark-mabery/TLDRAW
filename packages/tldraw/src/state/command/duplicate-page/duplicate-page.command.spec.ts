import { TLDrawState } from '~state'
import { mockDocument } from '~test'

describe('Duplicate page command', () => {
  const tlstate = new TLDrawState()

  it('does, undoes and redoes command', () => {
    tlstate.loadDocument(mockDocument)

    const initialId = tlstate.page.id

    tlstate.duplicatePage(tlstate.currentPageId)

    const nextId = tlstate.page.id

    tlstate.undo()

    expect(tlstate.page.id).toBe(initialId)

    tlstate.redo()

    expect(tlstate.page.id).toBe(nextId)
  })
})
