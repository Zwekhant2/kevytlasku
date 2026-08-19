import { useParams } from 'react-router-dom'

export default function InvoiceDetail() {
  const { id } = useParams()

  return (
    <section>
      <h1>Invoice {id}</h1>
      <p>The print-friendly detail view and totals panel land here on Day 5.</p>
    </section>
  )
}
