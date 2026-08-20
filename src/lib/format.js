const currencyFormatter = new Intl.NumberFormat('fi-FI', {
  style: 'currency',
  currency: 'EUR',
})

/** Format a number as EUR, Finnish locale: "1 040,00 €". */
export function formatCurrency(amount) {
  return currencyFormatter.format(amount ?? 0)
}

/** Format an ISO date string ("2026-08-19") as "19.8.2026". */
export function formatDate(isoDate) {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T00:00:00`)
  return new Intl.DateTimeFormat('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(date)
}

/** Format a Date's local year/month/day as an ISO string, without UTC conversion. */
function toLocalIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Today's date as an ISO string, for default form values. */
export function todayIso() {
  return toLocalIsoDate(new Date())
}

/** Add `days` to an ISO date string and return the result as an ISO string. */
export function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00`)
  date.setDate(date.getDate() + days)
  return toLocalIsoDate(date)
}

/** "August 2026" for a Date, defaulting to now — used for dashboard labels. */
export function formatMonthLabel(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(date)
}

/** True if an ISO date string falls in the same calendar month/year as `date`. */
export function isSameMonth(isoDate, date = new Date()) {
  const d = new Date(`${isoDate}T00:00:00`)
  return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth()
}
