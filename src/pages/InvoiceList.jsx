import { useMemo, useState } from 'react'
import { useInvoices } from '../context/InvoiceContext'
import { invoiceTotals } from '../lib/calc'
import InvoiceTable from '../components/InvoiceTable'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
]

// One accessor per sortable column, plus the direction a first click on
// that column should sort in — newest/largest first for dates and money,
// A→Z for text, so the first click always does the useful thing.
const SORT_COLUMNS = {
  invoiceNumber: { value: (invoice) => invoice.invoiceNumber, firstDirection: 'desc' },
  client: { value: (invoice) => invoice.client.name.toLowerCase(), firstDirection: 'asc' },
  issueDate: { value: (invoice) => invoice.issueDate, firstDirection: 'desc' },
  dueDate: { value: (invoice) => invoice.dueDate, firstDirection: 'desc' },
  status: { value: (invoice) => invoice.status, firstDirection: 'asc' },
  amount: { value: (invoice) => invoiceTotals(invoice).gross, firstDirection: 'desc' },
}

export default function InvoiceList() {
  const { invoices, loading, error, refresh } = useInvoices()
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sort, setSort] = useState({ key: 'issueDate', direction: 'desc' })

  const filteredInvoices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return invoices.filter((invoice) => {
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
      const matchesSearch = term === '' || invoice.client.name.toLowerCase().includes(term)
      return matchesStatus && matchesSearch
    })
  }, [invoices, statusFilter, searchTerm])

  const sortedInvoices = useMemo(() => {
    const { value } = SORT_COLUMNS[sort.key]
    const sorted = [...filteredInvoices].sort((a, b) => {
      const av = value(a)
      const bv = value(b)
      if (av < bv) return -1
      if (av > bv) return 1
      return 0
    })
    return sort.direction === 'desc' ? sorted.reverse() : sorted
  }, [filteredInvoices, sort])

  function toggleSort(key) {
    setSort((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: SORT_COLUMNS[key].firstDirection }
    })
  }

  const hasAnyInvoices = invoices.length > 0
  const hasFiltersActive = statusFilter !== 'all' || searchTerm.trim() !== ''

  return (
    <section className="page-enter">
      <h1>Invoices</h1>

      <div className="list-controls">
        <input
          type="search"
          className="input"
          placeholder="Search by client name…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search invoices by client name"
        />
        <div className="status-filter" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={statusFilter === filter.value ? 'active' : ''}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="invoice-table-scroll" aria-hidden="true">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Client</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6}>
                    <div className="skeleton skeleton-text" style={{ width: `${70 - i * 6}%`, height: 16 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && error && <ErrorMessage message={`Couldn't load invoices: ${error}`} onRetry={refresh} />}

      {!loading && !error && sortedInvoices.length > 0 && <InvoiceTable invoices={sortedInvoices} sort={sort} onSort={toggleSort} />}

      {!loading && !error && filteredInvoices.length === 0 && !hasAnyInvoices && (
        <EmptyState
          title="No invoices yet"
          message="Create your first invoice to see it here."
          actionLabel="New invoice"
          actionTo="/invoices/new"
        />
      )}

      {!loading && !error && filteredInvoices.length === 0 && hasAnyInvoices && hasFiltersActive && (
        <EmptyState title="No invoices match" message="Try a different search term or status filter." />
      )}
    </section>
  )
}
