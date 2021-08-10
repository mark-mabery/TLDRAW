import { TLDrawState } from '../../../tlstate'
import { mockDocument } from '../../../test-helpers'
import { TLDR } from '../../../tldr'
import { TextShape, TLDrawShape, TLDrawShapeType } from '../../../../shape'

describe('Text session', () => {
  const tlstate = new TLDrawState()

  it('begins, updates and completes session', () => {
    tlstate
      .loadDocument(mockDocument)
      .create(
        TLDR.getShapeUtils({ type: TLDrawShapeType.Text } as TLDrawShape).create({
          id: 'text1',
          parentId: 'page1',
        })
      )
      .select('text1')
      .startTextSession()
      .updateTextSession('Hello world')
      .completeSession()
      .undo()
      .redo()

    expect(tlstate.getShape<TextShape>('text1').text).toStrictEqual('Hello world')
  })

  it('cancels session', () => {
    tlstate
      .loadDocument(mockDocument)
      .create(
        TLDR.getShapeUtils({ type: TLDrawShapeType.Text } as TLDrawShape).create({
          id: 'text1',
          parentId: 'page1',
        })
      )
      .select('text1')
      .startTextSession()
      .updateTextSession('Hello world')
      .cancelSession()

    expect(tlstate.getShape<TextShape>('text1').text).toStrictEqual('Hello world')
  })
})
