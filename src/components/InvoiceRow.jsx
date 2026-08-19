import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { invoiceTotals } from '../lib/calc'
import { formatCurrency, formatDate } from '../lib/format'

export default function InvoiceRow({ invoice }) {
  const { gross } = invoiceTotals(invoice)

  return (
    <tr>
      <td data-label="Invoice">
        <Link to={`/invoices/${invoice.id}`}>#{invoice.invoiceNumber}</Link>
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
