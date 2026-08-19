// All invoice money math lives here — pure functions, no React.
//
// Convention: `unitPrice` on a line item always EXCLUDES VAT. Every
// calculation below assumes that and never mixes VAT-inclusive figures in.

/** Round to 2 decimals the way money should be rounded. */
export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/** One line: quantity × unit price, excluding VAT. */
export function lineNet(item) {
  return round2(item.quantity * item.unitPrice)
}

/** VAT for one line. */
export function lineVat(item) {
  return round2(lineNet(item) * (item.vatRate / 100))
}

/** One line, VAT included. */
export function lineGross(item) {
  return round2(lineNet(item) + lineVat(item))
}

/**
 * Totals for a whole invoice.
 *
 * VAT is summed per rate, then those per-rate totals are summed — never
 * calculated on the grand total directly. An invoice can mix 25.5% and
 * 10% lines, Finnish invoices must show each rate separately, and
 * rounding each line before summing gives a different (correct) answer
 * than summing first and rounding once.
 */
export function invoiceTotals(invoice) {
  const items = invoice.lineItems ?? []

  const net = round2(items.reduce((sum, item) => sum + lineNet(item), 0))

  const vatByRate = items.reduce((acc, item) => {
    acc[item.vatRate] = round2((acc[item.vatRate] ?? 0) + lineVat(item))
    return acc
  }, {})

  const vatTotal = round2(Object.values(vatByRate).reduce((sum, v) => sum + v, 0))

  const gross = round2(net + vatTotal)

  // Service fee is charged on the net (VAT-exclusive) amount.
  const serviceFee = round2(net * (invoice.serviceFeeRate / 100))

  // What the light entrepreneur actually receives, before income tax.
  const payout = round2(net - serviceFee)

  return { net, vatByRate, vatTotal, gross, serviceFee, payout }
}

export const VAT_RATES = [
  { rate: 25.5, label: '25.5% (yleinen / standard)' },
  { rate: 14, label: '14% (elintarvikkeet / food)' },
  { rate: 10, label: '10% (kirjat, lääkkeet / books, medicine)' },
  { rate: 0, label: '0% (verovapaa / exempt)' },
]

export const DEFAULT_SERVICE_FEE_RATE = 1.9
