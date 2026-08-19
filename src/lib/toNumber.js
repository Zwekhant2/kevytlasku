/** Coerce a raw input value (possibly '', possibly already a number) to a
 * finite number, defaulting to 0. Used at the boundary where form input
 * strings meet calc.js's pure-number contract — never inside the inputs
 * themselves, or a cleared field would visibly snap back to "0" mid-edit. */
export function toNumber(raw) {
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}
