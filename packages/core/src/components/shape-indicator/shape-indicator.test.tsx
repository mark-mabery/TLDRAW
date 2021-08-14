import * as React from 'react'
import { mockUtils, renderWithSvg } from '+test-utils'
import { ShapeIndicator } from './shape-indicator'

describe('shape indicator', () => {
  test('mounts component', () => {
    renderWithSvg(<ShapeIndicator shape={mockUtils.box.create({})} variant={'selected'} />)
  })
})
