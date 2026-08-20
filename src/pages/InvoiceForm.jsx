import { useReducer, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useInvoices } from '../context/InvoiceContext'
import { useToast } from '../context/ToastContext'
import { lineItemsReducer } from '../lib/lineItemsReducer'
import { toNumber } from '../lib/toNumber'
import { todayIso, addDays } from '../lib/format'
import { DEFAULT_SERVICE_FEE_RATE } from '../lib/calc'
import LineItemEditor from '../components/LineItemEditor'
import TotalsPanel from '../components/TotalsPanel'
import ErrorMessage from '../components/ErrorMessage'

const STATUS_OPTIONS = ['draft', 'sent', 'paid', 'overdue']
const EMPTY_CLIENT = { name: '', businessId: '', email: '', address: '' }

export default function InvoiceForm() {
  const { id } = useParams()
  const { invoices, loading } = useInvoices()

  // useReducer/useState only capture their initial value once, on mount. If
  // this component rendered the real form before the invoice had loaded
  // from context, "existing" would be undefined at that first render and the
  // line items would permanently start empty — even after the data arrives.
  // Resolving loading/not-found here, before the fields ever mount, avoids
  // that race entirely.
  if (id && loading) {
    return <p className="list-status">Loading invoice…</p>
  }

  const existing = id ? invoices.find((invoice) => invoice.id === id) : null

  if (id && !existing) {
    return <ErrorMessage message={`Invoice ${id} was not found.`} />
  }

  // Keyed by id (or 'new'): forces a fresh mount when navigating from
  // editing one invoice straight to another, so no stale reducer/form state
  // from the previous invoice leaks into the new one.
  return <InvoiceFormFields key={id ?? 'new'} existing={existing} />
}

function InvoiceFormFields({ existing }) {
  const navigate = useNavigate()
  const { addInvoice, editInvoice, nextInvoiceNumber } = useInvoices()
  const { showToast } = useToast()
  const isEdit = Boolean(existing)

  const [client, setClient] = useState(existing?.client ?? EMPTY_CLIENT)
  const [description, setDescription] = useState(existing?.description ?? '')
  const [issueDate, setIssueDate] = useState(existing?.issueDate ?? todayIso())
  const [paymentTermDays, setPaymentTermDays] = useState(existing?.paymentTermDays ?? 14)
  const [status, setStatus] = useState(existing?.status ?? 'draft')
  const [items, dispatch] = useReducer(lineItemsReducer, existing?.lineItems ?? [])
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const serviceFeeRate = existing?.serviceFeeRate ?? DEFAULT_SERVICE_FEE_RATE
  // Due date is derived, not independently stored — issueDate and
  // paymentTermDays are the single source of truth, so it can't drift out of
  // sync with either of them.
  const dueDate = addDays(issueDate, toNumber(paymentTermDays))

  function updateClient(field, value) {
    setClient((prev) => ({ ...prev, [field]: value }))
  }

  const hasLineItem = items.some((item) => item.description.trim() !== '')
  const canSubmit = client.name.trim() !== '' && hasLineItem

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) {
      setSubmitError('Add a client name and at least one described line item before saving.')
      return
    }

    setSubmitError(null)
    setSubmitting(true)

    const numericItems = items
      .filter((item) => item.description.trim() !== '')
      .map((item) => ({
        ...item,
        quantity: toNumber(item.quantity),
        unitPrice: toNumber(item.unitPrice),
      }))

    const payload = {
      invoiceNumber: existing?.invoiceNumber ?? nextInvoiceNumber(),
      client,
      description: description.trim() || null,
      issueDate,
      dueDate,
      paymentTermDays: toNumber(paymentTermDays),
      status,
      lineItems: numericItems,
      serviceFeeRate,
    }

    try {
      const saved = isEdit ? await editInvoice(existing.id, payload) : await addInvoice(payload)
      showToast(isEdit ? `Invoice #${saved.invoiceNumber} updated` : `Invoice #${saved.invoiceNumber} created`)
      navigate(`/invoices/${saved.id}`)
    } catch (err) {
      setSubmitError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <section className="page-enter">
      <h1>{isEdit ? `Edit invoice #${existing.invoiceNumber}` : 'New invoice'}</h1>

      <form className="invoice-form" onSubmit={handleSubmit}>
        <fieldset className="form-section">
          <legend>Client</legend>
          <div className="field-grid">
            <label className="field">
              Name
              <input className="input" value={client.name} onChange={(e) => updateClient('name', e.target.value)} required />
            </label>
            <label className="field">
              Business ID
              <input
                className="input"
                value={client.businessId}
                onChange={(e) => updateClient('businessId', e.target.value)}
                placeholder="1234567-8"
              />
            </label>
            <label className="field">
              Email
              <input className="input" type="email" value={client.email} onChange={(e) => updateClient('email', e.target.value)} />
            </label>
            <label className="field field--wide">
              Address
              <input className="input" value={client.address} onChange={(e) => updateClient('address', e.target.value)} />
            </label>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Description</legend>
          <div className="field-grid">
            <label className="field field--wide">
              Message to client
              <textarea
                className="input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this invoice is for, e.g. &ldquo;Website maintenance, August 2026&rdquo;"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Dates{isEdit ? ' & status' : ''}</legend>
          <div className="field-grid">
            <label className="field">
              Issue date
              <input className="input" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </label>
            <label className="field">
              Payment term (days)
              <input
                className="input"
                type="number"
                min="0"
                value={paymentTermDays}
                onChange={(e) => setPaymentTermDays(e.target.value)}
              />
            </label>
            <label className="field">
              Due date
              <input className="input" type="date" value={dueDate} disabled aria-readonly="true" />
            </label>
            {isEdit && (
              <label className="field">
                Status
                <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Line items</legend>
          <div className="form-layout">
            <LineItemEditor items={items} dispatch={dispatch} />
            <TotalsPanel items={items} serviceFeeRate={serviceFeeRate} />
          </div>
        </fieldset>

        {submitError && <ErrorMessage message={submitError} />}

        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create invoice'}
        </button>
      </form>
    </section>
  )
}
