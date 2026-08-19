import { invoiceTotals } from '../lib/calc'
import { formatCurrency } from '../lib/format'

// Line items store raw input strings (see LineItemEditor's numeric-input
// handling) so a cleared field doesn't visibly snap back to "0" while the
// user is still typing. calc.js expects clean numbers, so coercion happens
// here, at the boundary — never written back into the editor's own state.
function toNumber(raw) {
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export default function TotalsPanel({ items, serviceFeeRate }) {
  const numericItems = items.map((item) => ({
    ...item,
    quantity: toNumber(item.quantity),
    unitPrice: toNumber(item.unitPrice),
  }))

  const totals = invoiceTotals({ lineItems: numericItems, serviceFeeRate })
  const vatRows = Object.entries(totals.vatByRate)

  return (
    <dl className="totals-panel">
      <div className="totals-row">
        <dt>Net (excl. VAT)</dt>
        <dd>{formatCurrency(totals.net)}</dd>
      </div>

      {vatRows.map(([rate, amount]) => (
        <div className="totals-row totals-row--sub" key={rate}>
          <dt>VAT {rate}%</dt>
          <dd>{formatCurrency(amount)}</dd>
        </div>
      ))}

      <div className="totals-row totals-row--strong">
        <dt>Total (incl. VAT)</dt>
        <dd>{formatCurrency(totals.gross)}</dd>
      </div>

      <div className="totals-row totals-row--sub">
        <dt>Service fee ({serviceFeeRate}%)</dt>
        <dd>−{formatCurrency(totals.serviceFee)}</dd>
      </div>

      <div className="totals-row totals-row--payout">
        <dt>You&rsquo;ll receive</dt>
        <dd>{formatCurrency(totals.payout)}</dd>
      </div>
    </dl>
  )
}
