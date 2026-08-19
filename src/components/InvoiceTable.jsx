import InvoiceRow from './InvoiceRow'

export default function InvoiceTable({ invoices }) {
  return (
    <div className="invoice-table-scroll">
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
          {invoices.map((invoice) => (
            <InvoiceRow key={invoice.id} invoice={invoice} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
