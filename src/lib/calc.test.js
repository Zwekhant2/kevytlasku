import { describe, expect, it } from 'vitest'
import { round2, lineNet, lineVat, invoiceTotals } from './calc'

describe('round2', () => {
  it('rounds to 2 decimals', () => {
    expect(round2(1.005)).toBe(1.01)
    expect(round2(10.004)).toBe(10)
    expect(round2(10.005)).toBe(10.01)
  })

  it('avoids the classic floating-point rounding bug', () => {
    // 1.005 * 100 is 100.49999999999999 in floating point, so a naive
    // Math.round(x * 100) / 100 gives 1.00 instead of 1.01. round2 must not.
    expect(round2(1.005)).not.toBe(1)
  })
})

describe('lineNet / lineVat', () => {
  it('computes net and VAT for a single line', () => {
    const item = { quantity: 16, unitPrice: 65, vatRate: 25.5 }
    expect(lineNet(item)).toBe(1040)
    expect(lineVat(item)).toBe(265.2)
  })
})

describe('invoiceTotals', () => {
  it('sums a single-rate invoice correctly', () => {
    const invoice = {
      serviceFeeRate: 1.9,
      lineItems: [{ quantity: 16, unitPrice: 65, vatRate: 25.5 }],
    }
    const totals = invoiceTotals(invoice)

    expect(totals.net).toBe(1040)
    expect(totals.vatByRate).toEqual({ 25.5: 265.2 })
    expect(totals.vatTotal).toBe(265.2)
    expect(totals.gross).toBe(1305.2)
    expect(totals.serviceFee).toBe(19.76)
    expect(totals.payout).toBe(1020.24)
  })

  it('groups VAT by rate when an invoice mixes rates', () => {
    const invoice = {
      serviceFeeRate: 1.9,
      lineItems: [
        { quantity: 2, unitPrice: 100, vatRate: 25.5 },
        { quantity: 1, unitPrice: 50, vatRate: 10 },
      ],
    }
    const totals = invoiceTotals(invoice)

    expect(totals.vatByRate).toEqual({ 25.5: 51, 10: 5 })
    expect(totals.net).toBe(250)
    expect(totals.vatTotal).toBe(56)
    expect(totals.gross).toBe(306)
  })

  it('charges the service fee on net, not gross', () => {
    const invoice = {
      serviceFeeRate: 1.9,
      lineItems: [{ quantity: 1, unitPrice: 1000, vatRate: 25.5 }],
    }
    const totals = invoiceTotals(invoice)

    // Fee is 1.9% of the 1000 net, not of the 1255.50 gross.
    expect(totals.serviceFee).toBe(19)
    expect(totals.payout).toBe(981)
  })

  it('returns zeroed totals for an invoice with no line items', () => {
    const totals = invoiceTotals({ serviceFeeRate: 1.9, lineItems: [] })

    expect(totals.net).toBe(0)
    expect(totals.vatByRate).toEqual({})
    expect(totals.vatTotal).toBe(0)
    expect(totals.gross).toBe(0)
    expect(totals.serviceFee).toBe(0)
    expect(totals.payout).toBe(0)
  })
})
