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

## Coming next

Line-item editor (`useReducer`, dynamic rows, live totals) → full create/edit form → dashboard
summary cards and print-friendly detail view → a small .NET 8 minimal API + SQLite for real
persistence → responsive pass (table becomes cards under 768px) → deploy.

## Running it locally

```
git clone https://github.com/Zwekhant2/kevytlasku.git
cd kevytlasku
npm install
npm run dev
```

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
