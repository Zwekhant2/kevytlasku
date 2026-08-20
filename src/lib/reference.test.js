import { describe, expect, it } from 'vitest'
import { referenceNumber } from './reference'

describe('referenceNumber', () => {
  it('matches the standard Finnish viitenumero worked example', () => {
    expect(referenceNumber(1234561)).toBe('12345614')
  })

  it('appends a single check digit to the invoice number', () => {
    expect(referenceNumber(1001)).toBe('10016')
    expect(referenceNumber(1002)).toBe('10029')
  })
})
