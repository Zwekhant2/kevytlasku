// Mock data layer. Shaped exactly like the real API will be (async functions
// returning promises) so swapping this for real fetch calls later is a
// drop-in replacement — nothing that calls these functions has to change.

const mockInvoices = [
  {
    id: 'inv_001',
    invoiceNumber: 1001,
    client: {
      name: 'Rakennus Virtanen Oy',
      businessId: '1234567-8',
      email: 'laskut@virtanen.fi',
      address: 'Mannerheimintie 12, 00100 Helsinki',
    },
    issueDate: '2026-07-20',
    dueDate: '2026-08-03',
    paymentTermDays: 14,
    status: 'paid',
    lineItems: [
      { id: 'li_1', description: 'Sähkötyöt, 2 päivää', quantity: 16, unit: 'h', unitPrice: 65, vatRate: 25.5 },
    ],
    serviceFeeRate: 1.9,
  },
  {
    id: 'inv_002',
    invoiceNumber: 1002,
    client: {
      name: 'Kahvila Aromi Ky',
      businessId: '2345678-9',
      email: 'talous@aromikahvila.fi',
      address: 'Aleksanterinkatu 5, 00170 Helsinki',
    },
    issueDate: '2026-08-01',
    dueDate: '2026-08-15',
    paymentTermDays: 14,
    status: 'sent',
    lineItems: [
      { id: 'li_1', description: 'Verkkosivun ylläpito, elokuu', quantity: 1, unit: 'kk', unitPrice: 180, vatRate: 25.5 },
      { id: 'li_2', description: 'Leipomotarvikkeet', quantity: 12, unit: 'kpl', unitPrice: 8.5, vatRate: 14 },
    ],
    serviceFeeRate: 1.9,
  },
  {
    id: 'inv_003',
    invoiceNumber: 1003,
    client: {
      name: 'Studio Valo Oy',
      businessId: '3456789-0',
      email: 'laskutus@studiovalo.fi',
      address: 'Fredrikinkatu 33, 00120 Helsinki',
    },
    issueDate: '2026-07-05',
    dueDate: '2026-07-19',
    paymentTermDays: 14,
    status: 'overdue',
    lineItems: [
      { id: 'li_1', description: 'Kuvauspäivä, studiovuokra', quantity: 1, unit: 'pv', unitPrice: 420, vatRate: 25.5 },
    ],
    serviceFeeRate: 1.9,
  },
  {
    id: 'inv_004',
    invoiceNumber: 1004,
    client: {
      name: 'Pieni Puutarha Oy',
      businessId: '4567890-1',
      email: 'info@pienipuutarha.fi',
      address: 'Puistotie 8, 02100 Espoo',
    },
    issueDate: '2026-08-12',
    dueDate: '2026-08-26',
    paymentTermDays: 14,
    status: 'draft',
    lineItems: [
      { id: 'li_1', description: 'Pihasuunnittelu', quantity: 6, unit: 'h', unitPrice: 55, vatRate: 25.5 },
      { id: 'li_2', description: 'Taimet', quantity: 20, unit: 'kpl', unitPrice: 6.9, vatRate: 14 },
    ],
    serviceFeeRate: 1.9,
  },
  {
    id: 'inv_005',
    invoiceNumber: 1005,
    client: {
      name: 'Kielikoulu Lingua',
      businessId: '5678901-2',
      email: 'laskut@lingua.fi',
      address: 'Yliopistonkatu 2, 33100 Tampere',
    },
    issueDate: '2026-06-15',
    dueDate: '2026-06-29',
    paymentTermDays: 14,
    status: 'paid',
    lineItems: [
      { id: 'li_1', description: 'Suomen kielen kurssimateriaali', quantity: 15, unit: 'kpl', unitPrice: 24, vatRate: 10 },
    ],
    serviceFeeRate: 1.9,
  },
  {
    id: 'inv_006',
    invoiceNumber: 1006,
    client: {
      name: 'Rakennus Virtanen Oy',
      businessId: '1234567-8',
      email: 'laskut@virtanen.fi',
      address: 'Mannerheimintie 12, 00100 Helsinki',
    },
    issueDate: '2026-08-10',
    dueDate: '2026-08-24',
    paymentTermDays: 14,
    status: 'sent',
    lineItems: [
      { id: 'li_1', description: 'Sähkötyöt, jatko', quantity: 8, unit: 'h', unitPrice: 65, vatRate: 25.5 },
    ],
    serviceFeeRate: 1.9,
  },
]

const NETWORK_DELAY_MS = 150

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getInvoices() {
  await delay(NETWORK_DELAY_MS)
  return mockInvoices
}

export async function getInvoice(id) {
  await delay(NETWORK_DELAY_MS)
  const invoice = mockInvoices.find((inv) => inv.id === id)
  if (!invoice) throw new Error(`Invoice ${id} not found`)
  return invoice
}

export async function createInvoice(invoice) {
  await delay(NETWORK_DELAY_MS)
  const withId = { ...invoice, id: `inv_${crypto.randomUUID()}` }
  mockInvoices.unshift(withId)
  return withId
}

export async function updateInvoice(id, patch) {
  await delay(NETWORK_DELAY_MS)
  const index = mockInvoices.findIndex((inv) => inv.id === id)
  if (index === -1) throw new Error(`Invoice ${id} not found`)
  mockInvoices[index] = { ...mockInvoices[index], ...patch }
  return mockInvoices[index]
}
