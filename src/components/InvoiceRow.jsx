import { Link, useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { invoiceTotals } from '../lib/calc'
import { formatCurrency, formatDate } from '../lib/format'

export default function InvoiceRow({ invoice }) {
  const navigate = useNavigate()
  const { gross } = invoiceTotals(invoice)
  const detailPath = `/invoices/${invoice.id}`

  // The invoice-number cell has the real link (keyboard focus, middle-click,
  // ctrl/cmd-click all work correctly there). This makes the rest of the
  // row clickable too, since "click anywhere on the row" is what people
  // actually expect from a list, not just one small link inside it. Clicks
  // that land on the link itself are left alone so its native behaviour
  // isn't hijacked or double-fired.
  function handleRowClick(e) {
    if (e.target.closest('a')) return
    navigate(detailPath)
  }

  return (
    <tr className="invoice-row" onClick={handleRowClick}>
      <td data-label="Invoice">
        <Link to={detailPath}>#{invoice.invoiceNumber}</Link>
      </td>
      <td data-label="Client">{invoice.client.name}</td>
      <td data-label="Issued">{formatDate(invoice.issueDate)}</td>
      <td data-label="Due">{formatDate(invoice.dueDate)}</td>
      <td data-label="Status">
        <StatusBadge status={invoice.status} />
      </td>
      <td data-label="Amount" className="amount-cell">
        {formatCurrency(gross)}
      </td>
    </tr>
  )
}
