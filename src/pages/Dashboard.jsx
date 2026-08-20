import { useMemo } from 'react'
import { useInvoices } from '../context/InvoiceContext'
import { useCountUp } from '../hooks/useCountUp'
import { invoiceTotals, monthlyTotals } from '../lib/calc'
import { formatCurrency, formatMonthLabel, isSameMonth } from '../lib/format'
import SummaryCard from '../components/SummaryCard'
import RevenueChart from '../components/RevenueChart'
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

  const monthly = useMemo(() => monthlyTotals(invoices), [invoices])

  // Hooks must run unconditionally every render, so these sit above the
  // loading/error early returns below — each is a fixed, named value rather
  // than a loop over STATUS_ORDER, since calling a hook inside a .map() is
  // an easy way to break the rules of hooks even when the array length
  // never changes.
  const animatedOutstanding = useCountUp(summary.outstanding)
  const animatedPaidThisMonth = useCountUp(summary.paidThisMonth)
  const animatedCounts = {
    draft: useCountUp(summary.counts.draft),
    sent: useCountUp(summary.counts.sent),
    paid: useCountUp(summary.counts.paid),
    overdue: useCountUp(summary.counts.overdue),
  }

  if (error) {
    return <ErrorMessage message={`Couldn't load invoices: ${error}`} onRetry={refresh} />
  }

  return (
    <section className="page-enter">
      <h1>Dashboard</h1>

      {loading ? (
        <>
          <div className="hero-balance hero-balance--skeleton skeleton" aria-hidden="true" />
          <div className="revenue-chart-card revenue-chart-card--skeleton skeleton" aria-hidden="true" />
          <div className="summary-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="summary-card" key={i} aria-hidden="true">
                <div className="skeleton skeleton-text" style={{ width: '60%', height: 12 }} />
                <div className="skeleton skeleton-text" style={{ width: '80%', height: 26, marginTop: 10 }} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="hero-balance">
            <div className="hero-balance-orb hero-balance-orb--1" aria-hidden="true" />
            <div className="hero-balance-orb hero-balance-orb--2" aria-hidden="true" />
            <p className="hero-balance-label">Outstanding</p>
            <p className="hero-balance-value">{formatCurrency(animatedOutstanding)}</p>
            <p className="hero-balance-hint">Across every sent and overdue invoice</p>
            <div className="hero-balance-stats">
              <div className="hero-balance-stat">
                <span className="hero-balance-stat-value">{Math.round(animatedCounts.sent)}</span>
                <span className="hero-balance-stat-label">Sent</span>
              </div>
              <div className="hero-balance-stat">
                <span className="hero-balance-stat-value">{Math.round(animatedCounts.overdue)}</span>
                <span className="hero-balance-stat-label">Overdue</span>
              </div>
              <div className="hero-balance-stat">
                <span className="hero-balance-stat-value">{formatCurrency(animatedPaidThisMonth)}</span>
                <span className="hero-balance-stat-label">Paid {formatMonthLabel()}</span>
              </div>
            </div>
          </div>

          <RevenueChart months={monthly} />

          <div className="summary-grid">
            {STATUS_ORDER.map((status) => (
              <SummaryCard
                key={status}
                label={status[0].toUpperCase() + status.slice(1)}
                value={Math.round(animatedCounts[status])}
                tone={status === 'overdue' ? 'danger' : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
