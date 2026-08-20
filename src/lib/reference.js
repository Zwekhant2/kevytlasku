const WEIGHTS = [7, 3, 1]

/**
 * Finnish standard reference number (viitenumero): append a mod-10 checksum
 * digit to a base number, weighting each digit 7/3/1 cyclically from the
 * right. Lets a client's bank match an incoming payment to this invoice.
 */
export function referenceNumber(base) {
  const digits = String(base).split('').reverse()
  const sum = digits.reduce((total, digit, index) => total + Number(digit) * WEIGHTS[index % 3], 0)
  const checkDigit = (10 - (sum % 10)) % 10
  return `${base}${checkDigit}`
}
