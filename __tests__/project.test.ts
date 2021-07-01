import state from 'state'
import * as json from './__mocks__/document.json'

describe('project', () => {
  state.reset()
  state.enableLog(true)

  it('mounts the state', () => {
    state.send('MOUNTED')

    expect(state.isIn('ready')).toBe(true)
  })

  it('loads file from json', () => {
    state.send('LOADED_FROM_FILE', { json: JSON.stringify(json) })

    expect(state.isIn('ready')).toBe(true)
    expect(state.data.document).toMatchSnapshot('data after mount from file')
  })
})

describe('restoring project', () => {
  state.reset()
  state.enableLog(true)

  it('remounts the state after mutating the current state', () => {
    state
      .send('MOUNTED')
      .send('LOADED_FROM_FILE', { json: JSON.stringify(json) })
      .send('CLEARED_PAGE')

    expect(
      state.data.document.pages[state.data.currentPageId].shapes
    ).toStrictEqual({})

    state
      .send('MOUNTED')
      .send('LOADED_FROM_FILE', { json: JSON.stringify(json) })

    expect(state.data.document).toMatchSnapshot('data after re-mount from file')
  })
})
