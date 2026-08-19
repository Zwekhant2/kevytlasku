import { describe, expect, it } from 'vitest'
import { lineItemsReducer } from './lineItemsReducer'

// The reducer is the actual reason useReducer was chosen over five useState
// calls: the three operations transform the same array, and keeping them in
// one place means this logic is testable independently of the component.

describe('lineItemsReducer', () => {
  it('adds a new line item with sensible defaults', () => {
    const result = lineItemsReducer([], { type: 'add' })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      description: '',
      quantity: 1,
      unit: 'h',
      unitPrice: 0,
      vatRate: 25.5,
    })
    expect(result[0].id).toBeTypeOf('string')
  })

  it('removes only the targeted item by id', () => {
    const items = [
      { id: 'a', description: 'First' },
      { id: 'b', description: 'Second' },
      { id: 'c', description: 'Third' },
    ]

    const result = lineItemsReducer(items, { type: 'remove', id: 'b' })

    expect(result.map((i) => i.id)).toEqual(['a', 'c'])
  })

  it('updates only the targeted field on the targeted item', () => {
    const items = [
      { id: 'a', description: 'First', quantity: 1 },
      { id: 'b', description: 'Second', quantity: 1 },
    ]

    const result = lineItemsReducer(items, { type: 'update', id: 'b', field: 'quantity', value: '5' })

    expect(result[0]).toEqual(items[0])
    expect(result[1]).toEqual({ id: 'b', description: 'Second', quantity: '5' })
  })

  it('stores the raw input value on update without coercing it', () => {
    // A cleared numeric field arrives as ''. The reducer must not turn that
    // into 0 — that would make the input visibly snap to "0" mid-edit, before
    // the user has typed a replacement value.
    const items = [{ id: 'a', quantity: 5 }]

    const result = lineItemsReducer(items, { type: 'update', id: 'a', field: 'quantity', value: '' })

    expect(result[0].quantity).toBe('')
  })

  it('throws on an unknown action type', () => {
    expect(() => lineItemsReducer([], { type: 'nope' })).toThrow('Unknown action: nope')
  })
})
