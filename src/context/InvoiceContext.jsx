import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getInvoices, createInvoice, updateInvoice } from '../api/invoices'

const InvoiceContext = createContext(null)

export function InvoiceProvider({ children }) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    return getInvoices()
      .then(setInvoices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Fetching on mount synchronizes with an external system (the API) — the
  // sanctioned use of an effect, not state derived from props/state.
  useEffect(() => {
    refresh()
  }, [refresh])

  // Both go through the api/ layer — which owns persistence (localStorage
  // for now, a real database once Day 6 lands) — rather than this context
  // touching storage itself. That keeps this file unchanged when the mock
  // in api/invoices.js is swapped for real HTTP calls.
  const addInvoice = useCallback(async (invoice) => {
    const created = await createInvoice(invoice)
    setInvoices((prev) => [created, ...prev])
    return created
  }, [])

  const editInvoice = useCallback(async (id, patch) => {
    const updated = await updateInvoice(id, patch)
    setInvoices((prev) => prev.map((invoice) => (invoice.id === id ? updated : invoice)))
    return updated
  }, [])

  const nextInvoiceNumber = useCallback(() => {
    const highest = invoices.reduce((max, invoice) => Math.max(max, invoice.invoiceNumber), 1000)
    return highest + 1
  }, [invoices])

  const value = {
    invoices,
    loading,
    error,
    refresh,
    addInvoice,
    editInvoice,
    nextInvoiceNumber,
  }

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>
}

export function useInvoices() {
  const context = useContext(InvoiceContext)
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider')
  }
  return context
}
