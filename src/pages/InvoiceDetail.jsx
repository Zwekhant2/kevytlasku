import { Link, useParams } from 'react-router-dom'
import { useInvoices } from '../context/InvoiceContext'
import { useSettings } from '../context/SettingsContext'
import { lineNet } from '../lib/calc'
import { formatCurrency, formatDate } from '../lib/format'
import { referenceNumber } from '../lib/reference'
import StatusBadge from '../components/StatusBadge'
import TotalsPanel from '../components/TotalsPanel'
import ErrorMessage from '../components/ErrorMessage'

export default function InvoiceDetail() {
  const { id } = useParams()
  const { invoices, loading } = useInvoices()
  const { settings } = useSettings()

  if (loading) {
    return <p className="list-status">Loading invoice…</p>
  }

  const invoice = invoices.find((inv) => inv.id === id)

  if (!invoice) {
    return <ErrorMessage message={`Invoice ${id} was not found.`} />
  }

  return (
    <section className="invoice-detail page-enter">
      <div className="invoice-detail-toolbar">
        <Link to="/invoices">&larr; Back to invoices</Link>
        <div className="invoice-detail-actions">
          <Link className="button button--outline" to={`/invoices/${invoice.id}/edit`}>
            Edit
          </Link>
          <button type="button" className="button" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>

      <div className="invoice-detail-sheet">
        <header className="invoice-detail-header">
          <div>
            <h1>Invoice #{invoice.invoiceNumber}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          <div className="invoice-detail-dates">
            <p>
              Issued <strong>{formatDate(invoice.issueDate)}</strong>
            </p>
            <p>
              Due <strong>{formatDate(invoice.dueDate)}</strong>
            </p>
          </div>
        </header>

        {invoice.description && <p className="invoice-detail-description">{invoice.description}</p>}

        <div className="invoice-detail-parties">
          <div className="invoice-detail-client">
            <p className="invoice-detail-label">Bill to</p>
            <p className="invoice-detail-client-name">{invoice.client.name}</p>
            {invoice.client.businessId && <p>Y-tunnus {invoice.client.businessId}</p>}
            {invoice.client.address && <p>{invoice.client.address}</p>}
            {invoice.client.email && <p>{invoice.client.email}</p>}
          </div>

          <div className="invoice-detail-client">
            <p className="invoice-detail-label">Pay to</p>
            <p className="invoice-detail-client-name">{settings?.companyName ?? 'Your company'}</p>
            {settings?.iban && <p>IBAN {settings.iban}</p>}
            {settings?.bic && <p>BIC {settings.bic}</p>}
            <p>Reference {referenceNumber(invoice.invoiceNumber)}</p>
          </div>
        </div>

        <div className="invoice-table-scroll">
          <table className="invoice-table detail-line-items">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Unit price</th>
                <th>VAT</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id}>
                  <td data-label="Description">{item.description}</td>
                  <td data-label="Qty">{item.quantity}</td>
                  <td data-label="Unit">{item.unit}</td>
                  <td data-label="Unit price" className="amount-cell">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td data-label="VAT">{item.vatRate}%</td>
                  <td data-label="Net" className="amount-cell">
                    {formatCurrency(lineNet(item))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-detail-totals">
          <TotalsPanel items={invoice.lineItems} serviceFeeRate={invoice.serviceFeeRate} />
        </div>
      </div>
    </section>
  )
}
