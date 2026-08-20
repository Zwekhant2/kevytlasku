// Real calls to the .NET API (see /api). Every function here has the exact
// same name and signature the localStorage-backed mock had through Day 5 —
// that was the point of keeping persistence out of Context: nothing outside
// this file changed to make this swap.
import { apiClient } from './client'

export async function getInvoices() {
  return apiClient.get('/api/invoices')
}

export async function getInvoice(id) {
  return apiClient.get(`/api/invoices/${id}`)
}

export async function createInvoice(invoice) {
  return apiClient.post('/api/invoices', invoice)
}

export async function updateInvoice(id, invoice) {
  return apiClient.put(`/api/invoices/${id}`, invoice)
}
