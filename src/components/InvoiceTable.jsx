import InvoiceRow from './InvoiceRow'

const COLUMNS = [
  { key: 'invoiceNumber', label: 'Invoice' },
  { key: 'client', label: 'Client' },
  { key: 'issueDate', label: 'Issued' },
  { key: 'dueDate', label: 'Due' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount' },
]

export default function InvoiceTable({ invoices, sort, onSort }) {
  return (
    <div className="invoice-table-scroll">
      <table className="invoice-table">
        <thead>
          <tr>
            {COLUMNS.map((column) => {
              const active = sort.key === column.key
              return (
                <th key={column.key} aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="sort-button" onClick={() => onSort(column.key)}>
                    {column.label}
                    <span className={`sort-indicator${active ? ' sort-indicator--active' : ''}`} aria-hidden="true">
                      {active && sort.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <InvoiceRow key={invoice.id} invoice={invoice} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
