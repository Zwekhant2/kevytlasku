import { Link, useParams } from 'react-router-dom'
import { useInvoices } from '../context/InvoiceContext'
import { invoiceTotals } from '../lib/calc'
import { formatCurrency } from '../lib/format'
import ErrorMessage from '../components/ErrorMessage'

export default function InvoiceDetail() {
  const { id } = useParams()
  const { invoices, loading } = useInvoices()

  if (loading) {
    return <p className="list-status">Loading invoice…</p>
  }

  const invoice = invoices.find((inv) => inv.id === id)

  if (!invoice) {
    return <ErrorMessage message={`Invoice ${id} was not found.`} />
  }

  const { gross } = invoiceTotals(invoice)

  return (
    <section>
      <h1>
        Invoice #{invoice.invoiceNumber} — {invoice.client.name}
      </h1>
      <p>
        Status: {invoice.status} · Total: {formatCurrency(gross)}
      </p>
      <p>The full print-friendly layout and totals breakdown land here on Day 5.</p>
      <Link className="button" to={`/invoices/${invoice.id}/edit`}>
        Edit invoice
      </Link>
    </section>
  )
}
