import { useMemo } from 'react'
import { useInvoices } from '../context/InvoiceContext'
import { invoiceTotals } from '../lib/calc'
import { formatCurrency, formatMonthLabel, isSameMonth } from '../lib/format'
import SummaryCard from '../components/SummaryCard'
import ErrorMessage from '../components/ErrorMessage'

const STATUS_ORDER = ['draft', 'sent', 'paid', 'overdue']

export default function Dashboard() {
  const { invoices, loading, error, refresh } = useInvoices()

  const summary = useMemo(() => {
    const counts = { draft: 0, sent: 0, paid: 0, overdue: 0 }
    let outstanding = 0
    let paidThisMonth = 0

    for (const invoice of invoices) {
      counts[invoice.status] = (counts[invoice.status] ?? 0) + 1
      const { gross } = invoiceTotals(invoice)

      if (invoice.status === 'sent' || invoice.status === 'overdue') {
        outstanding += gross
      }
      // Paid-this-month is approximated from issueDate, since the data model
      // doesn't track a separate "paid on" date — see the README.
      if (invoice.status === 'paid' && isSameMonth(invoice.issueDate)) {
        paidThisMonth += gross
      }
    }

    return { counts, outstanding, paidThisMonth }
  }, [invoices])

  if (loading) {
    return <p className="list-status">Loading dashboard…</p>
  }

  if (error) {
    return <ErrorMessage message={`Couldn't load invoices: ${error}`} onRetry={refresh} />
  }

  return (
    <section>
      <h1>Dashboard</h1>

      <div className="summary-grid">
        <SummaryCard label="Outstanding" value={formatCurrency(summary.outstanding)} hint="Sent + overdue" />
        <SummaryCard
          label="Paid this month"
          value={formatCurrency(summary.paidThisMonth)}
          hint={formatMonthLabel()}
        />
        {STATUS_ORDER.map((status) => (
          <SummaryCard
            key={status}
            label={status[0].toUpperCase() + status.slice(1)}
            value={summary.counts[status]}
            tone={status === 'overdue' ? 'danger' : undefined}
          />
        ))}
      </div>
    </section>
  )
}
