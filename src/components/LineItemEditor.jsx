import { VAT_RATES } from '../lib/calc'

export default function LineItemEditor({ items, dispatch }) {
  function update(id, field, value) {
    dispatch({ type: 'update', id, field, value })
  }

  return (
    <div className="line-item-editor">
      {items.length === 0 && <p className="line-item-empty">No line items yet — add one below.</p>}

      {items.length > 0 && (
        // Column headers at >=640px, where the row is a grid and the inputs'
        // own labels are visually hidden. Below that, each input shows its
        // own label instead (see .li-field-label) — a placeholder alone
        // isn't a label once the user has typed something into the field.
        <div className="line-item-header" aria-hidden="true">
          <span>Description</span>
          <span>Qty</span>
          <span>Unit</span>
          <span>Unit price</span>
          <span>VAT</span>
          <span />
        </div>
      )}

      {items.map((item) => (
        // The item's own id, never the array index: removing a middle row with
        // an index key makes React reuse the wrong DOM nodes and input values
        // visibly jump to the wrong rows.
        <div className="line-item-row" key={item.id}>
          <label className="li-field">
            <span className="li-field-label">Description</span>
            <input
              type="text"
              className="input li-description"
              placeholder="Description"
              value={item.description}
              onChange={(e) => update(item.id, 'description', e.target.value)}
            />
          </label>
          <label className="li-field">
            <span className="li-field-label">Quantity</span>
            <input
              type="number"
              className="input li-quantity"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => update(item.id, 'quantity', e.target.value)}
              min="0"
              step="any"
            />
          </label>
          <label className="li-field">
            <span className="li-field-label">Unit</span>
            <input
              type="text"
              className="input li-unit"
              placeholder="Unit"
              value={item.unit}
              onChange={(e) => update(item.id, 'unit', e.target.value)}
            />
          </label>
          <label className="li-field">
            <span className="li-field-label">Unit price</span>
            <input
              type="number"
              className="input li-price"
              placeholder="Unit price"
              value={item.unitPrice}
              onChange={(e) => update(item.id, 'unitPrice', e.target.value)}
              min="0"
              step="0.01"
            />
          </label>
          <label className="li-field">
            <span className="li-field-label">VAT rate</span>
            <select
              className="select li-vat"
              value={item.vatRate}
              onChange={(e) => update(item.id, 'vatRate', Number(e.target.value))}
            >
              {VAT_RATES.map((v) => (
                <option key={v.rate} value={v.rate}>
                  {v.rate}%
                </option>
              ))}
            </select>
          </label>
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
