# kevytlasku

A small invoicing app for Finnish light entrepreneurs (*kevytyrittäjät*) — people who invoice
clients without setting up their own company, through a billing service that takes a
percentage-based service fee per invoice. This project models that: create an invoice, track
its status, and see what you'd actually be paid after Finnish VAT and the service fee are
worked out.

**Status: work in progress**, built incrementally and committed in small steps. This README
will grow with the project; right now it reflects what actually exists, not the finished plan.

## What's built so far

- Vite + React 19 scaffold, plain CSS (mobile-first), no component library
- Client-side routing (React Router): dashboard, invoice list, invoice form, invoice detail
- `src/lib/calc.js` — the invoice math as pure, dependency-free functions:
  net/VAT/gross per line, VAT totalled **per rate** (Finnish invoices can mix 25.5%, 14%, and
  10% lines and must show each separately), and the service fee computed on the net amount
- 7 passing Vitest unit tests on the calculation module, including the classic
  floating-point rounding trap (`1.005 * 100` is not `100.5` in IEEE 754)
- Invoice list wired to a mock API (`src/api/invoices.js`) with status filter, client-name
  search, and real loading / error / empty states — not just the happy path
- A temporary horizontal-scroll table on narrow screens, so nothing is unreachable before the
  Day 7 responsive pass replaces it with real stacked cards
- `LineItemEditor` — add/remove/edit line items via a `useReducer` (`src/lib/lineItemsReducer.js`),
  keyed by each item's own id (never array index, so removing a row can't scramble the others),
  with numeric fields that store the raw typed value and only coerce to a number at calculation
  time — so clearing a price field doesn't visibly snap back to "0" mid-edit
- `TotalsPanel` — net, VAT broken out per rate, gross, service fee, and payout, recomputed live
  from the line items on every keystroke via `calc.js`
- 5 more unit tests on the reducer (12 total), including one that pins down the
  clear-to-empty-string behaviour so a regression would fail loudly
- Full create/edit form: client details, issue date + payment term (due date is derived from
  the two, never independently editable, so it can't drift out of sync), a status field in edit
  mode, and a real Save that goes through Context into the mock API
- `InvoiceContext` (`src/context/InvoiceContext.jsx`) as the single source of truth for invoice
  state — the list, the form, and the detail page all read from the same place, so creating or
  editing an invoice is reflected everywhere immediately, no manual refetching
- localStorage persistence, owned by the mock API itself (`src/api/invoices.js`) rather than by
  Context — so Day 6 could swap the mock's internals for real HTTP calls to the .NET API without
  touching Context, the form, or any other component (and it didn't — see below)
- Dashboard summary cards: outstanding (sent + overdue), paid this month, and a count per status
- A full invoice detail view — client info, a per-line breakdown (qty, unit price, VAT rate, net),
  and the same `TotalsPanel` the form uses — plus a print stylesheet that hides the nav and
  toolbar and lets the invoice itself fill the page
- A real backend: a .NET 8 minimal API (`/api`) over SQLite, using Dapper — two tables
  (`Invoices`, `LineItems`), a foreign key with `ON DELETE CASCADE`, and a `CHECK` constraint on
  `Status` so the database enforces valid values, not just the UI. `src/api/invoices.js` now
  calls it over HTTP; `src/api/client.js` is the small fetch wrapper behind that. As predicted,
  Context, the form, and the list needed zero changes to make this swap

## Coming next

A responsive pass (table becomes cards under 768px) → deploy.

## Running it locally

Frontend:

```
git clone https://github.com/Zwekhant2/kevytlasku.git
cd kevytlasku
npm install
npm run dev
```

Backend (needs the [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)), in a second
terminal:

```
cd api
dotnet run
```

The API listens on `http://localhost:5200` and creates+seeds `api/kevytlasku.db` on first run —
nothing to configure. The frontend defaults to that same URL; override it by setting
`VITE_API_URL` in a `.env` file if you're pointing at a different API instance.

Run the calculation tests:

```
npm run test
```

## Deliberately out of scope

Authentication, real email sending, PDF generation, and payment integration are not part of
this project. It's a portfolio piece focused on the parts that are interesting to build and
talk about — the invoice math, the form state, and a real (if small) persistence layer — not a
production billing system.

## Why these choices

- **Money math lives in one file, as pure functions.** `src/lib/calc.js` takes plain numbers
  and objects in, returns plain numbers out — no React. That's what makes it unit-testable in
  isolation, and it's the first thing to read to understand how the app thinks about money.
- **`unitPrice` on a line item always excludes VAT.** Decided once, documented in the code
  comment, never mixed with VAT-inclusive figures — that mix-up is the most common bug in
  invoicing software.
- **No Redux, no Tailwind, no UI kit.** `useState`/`useReducer` and hand-written CSS are enough
  at this size, and using them directly is more honest about what's actually being demonstrated.
- **`useReducer` for line items, not five `useState` calls.** Add/remove/update all transform
  the same array, so keeping that logic in one reducer makes it testable on its own — see
  `src/lib/lineItemsReducer.test.js` — independent of whether the component even renders.
- **The invoice form is keyed by invoice id.** `useReducer`/`useState` only read their initial
  value on mount, so a single long-lived form component would either start empty if the invoice
  hadn't loaded yet (a real race on a direct link to an edit URL) or leak stale state when
  navigating from editing one invoice straight to another. Splitting the route into a thin outer
  component (resolves loading/not-found first) and a `key={id}`-ed inner one forces a clean
  remount instead, with correct initial values, every time.
- **The mock API persists to localStorage, not the Context.** That keeps persistence entirely
  inside `src/api/invoices.js`, which is also the only file Day 6 will touch to swap the mock
  for real HTTP calls — Context, the form, and the list don't change at all.
- **"Paid this month" is approximated from `issueDate`.** The data model doesn't have a separate
  "paid on" date, so this is a deliberate simplification, not an oversight — a real system would
  record the actual payment date and use that instead.
- **Two flat tables, mapped by hand — no ORM.** `Invoices` and `LineItems` are joined and
  reassembled into the nested shape the frontend expects with plain SQL and a `ToInvoice`
  function (`api/InvoiceStore.cs`), not EF Core change-tracking or Dapper's multi-mapping. At
  this size that's less machinery to explain, not less correctness.
- **An update replaces an invoice's line items wholesale**, rather than diffing which rows were
  added, changed, or removed. The form always sends the complete current set, never a partial
  patch, so delete-then-reinsert inside one transaction is simpler and exactly as correct as a
  diff would be here.
- **Totals are computed, never stored** — in the database or anywhere else. If asked when you
  *would* store them: once an invoice is sent and the historical figure must stay fixed even if
  a VAT rate changes later. Not needed at this stage.
