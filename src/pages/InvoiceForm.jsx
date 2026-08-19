import { useParams } from 'react-router-dom'
import { useReducer } from 'react'
import LineItemEditor from '../components/LineItemEditor'
import TotalsPanel from '../components/TotalsPanel'
import { DEFAULT_SERVICE_FEE_RATE } from '../lib/calc'
import { lineItemsReducer } from '../lib/lineItemsReducer'

export default function InvoiceForm() {
  const { id } = useParams()
  const [items, dispatch] = useReducer(lineItemsReducer, [])

  return (
    <section>
      <h1>{id ? `Edit invoice ${id}` : 'New invoice'}</h1>
      <p className="form-note">Client details, dates, and saving land here on Day 4.</p>

      <div className="form-layout">
        <LineItemEditor items={items} dispatch={dispatch} />
        <TotalsPanel items={items} serviceFeeRate={DEFAULT_SERVICE_FEE_RATE} />
      </div>
    </section>
  )
}
