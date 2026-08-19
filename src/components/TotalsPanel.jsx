import { invoiceTotals } from '../lib/calc'
import { formatCurrency } from '../lib/format'
import { toNumber } from '../lib/toNumber'

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
