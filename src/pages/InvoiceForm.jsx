import { useParams } from 'react-router-dom'

export default function InvoiceForm() {
  const { id } = useParams()

  return (
    <section>
      <h1>{id ? `Edit invoice ${id}` : 'New invoice'}</h1>
      <p>The client details form and LineItemEditor (useReducer) land here on Day 3–4.</p>
    </section>
  )
}
