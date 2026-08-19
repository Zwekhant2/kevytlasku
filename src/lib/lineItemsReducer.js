// Pure reducer for the LineItemEditor's rows. Kept out of the component file
// so it can be Fast-Refreshed independently and imported into tests without
// pulling in React.
export function lineItemsReducer(items, action) {
  switch (action.type) {
    case 'add':
      return [
        ...items,
        {
          id: crypto.randomUUID(),
          description: '',
          quantity: 1,
          unit: 'h',
          unitPrice: 0,
          vatRate: 25.5,
        },
      ]

    case 'remove':
      return items.filter((item) => item.id !== action.id)

    case 'update':
      return items.map((item) => (item.id === action.id ? { ...item, [action.field]: action.value } : item))

    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}
