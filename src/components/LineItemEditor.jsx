import { VAT_RATES } from '../lib/calc'

export default function LineItemEditor({ items, dispatch }) {
  function update(id, field, value) {
    dispatch({ type: 'update', id, field, value })
  }

  return (
    <div className="line-item-editor">
      {items.length === 0 && <p className="line-item-empty">No line items yet — add one below.</p>}

      {items.map((item) => (
        // The item's own id, never the array index: removing a middle row with
        // an index key makes React reuse the wrong DOM nodes and input values
        // visibly jump to the wrong rows.
        <div className="line-item-row" key={item.id}>
          <input
            type="text"
            className="input li-description"
            placeholder="Description"
            value={item.description}
            onChange={(e) => update(item.id, 'description', e.target.value)}
            aria-label="Description"
          />
          <input
            type="number"
            className="input li-quantity"
            placeholder="Qty"
            value={item.quantity}
            onChange={(e) => update(item.id, 'quantity', e.target.value)}
            aria-label="Quantity"
            min="0"
            step="any"
          />
          <input
            type="text"
            className="input li-unit"
            placeholder="Unit"
            value={item.unit}
            onChange={(e) => update(item.id, 'unit', e.target.value)}
            aria-label="Unit"
          />
          <input
            type="number"
            className="input li-price"
            placeholder="Unit price"
            value={item.unitPrice}
            onChange={(e) => update(item.id, 'unitPrice', e.target.value)}
            aria-label="Unit price, excluding VAT"
            min="0"
            step="0.01"
          />
          <select
            className="select li-vat"
            value={item.vatRate}
            onChange={(e) => update(item.id, 'vatRate', Number(e.target.value))}
            aria-label="VAT rate"
          >
            {VAT_RATES.map((v) => (
              <option key={v.rate} value={v.rate}>
                {v.rate}%
              </option>
            ))}
          </select>
          <button
            type="button"
            className="li-remove"
            onClick={() => dispatch({ type: 'remove', id: item.id })}
            aria-label={`Remove line${item.description ? `: ${item.description}` : ''}`}
          >
            ✕
          </button>
        </div>
      ))}

      <button type="button" className="button button--ghost" onClick={() => dispatch({ type: 'add' })}>
        + Add line
      </button>
    </div>
  )
}
