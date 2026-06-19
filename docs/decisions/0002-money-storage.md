# ADR 0002 — Money storage: whole KES shillings as `bigint`

- **Status:** Accepted
- **Date:** 2026-06-20
- **Context:** Phase 3 (Database & Data Layer) — see [tasks.md](../../tasks.md)

## Context

Every amount in Black Stars is in Kenyan shillings (KES). Phase 3 needs one
storage representation for money in Postgres. The options were integer minor
units (cents), integer whole shillings, or `numeric(p,s)` decimal.

Two facts drive the decision:

1. **KES has no practically-used sub-unit.** The cent exists in theory, but bar
   prices, M-Pesa transactions and the prototype dataset are all whole
   shillings. No amount in `data.js` carries a fraction.
2. **The app already treats money as whole shillings.** The Phase 1 helpers
   `money()` / `moneyK()` ([src/lib/format.ts](../../src/lib/format.ts)) format
   the raw number as shillings with no division, and the prototype's `reduce`
   math is integer shilling arithmetic.

## Decision

Store money as **`bigint` whole KES shillings**, mapped to a JS `number`
(`bigint({ mode: "number" })`, via the `money()` helper in
[src/db/schema/\_shared.ts](../../src/db/schema/_shared.ts)).

- `bigint` (not `integer`) so cumulative aggregates can't overflow `int4`
  (monthly revenue already reaches ~18.3M; annual/all-venue sums would exceed
  2.1B). Whole-shilling values stay well inside the safe `number` integer range.
- The `Money` type in [src/types/index.ts](../../src/types/index.ts) documents
  the unit; percentages use `numeric(5, 2)`.

- _Rejected:_ **integer cents (minor units)** — future-proofs sub-shilling
  precision nobody uses, and would force a ×100 conversion of every seed value
  and the existing UI helpers for no benefit.
- _Rejected:_ **`numeric(p, s)`** — exact, but returns as a string in JS
  (parsing everywhere) and is heavier than integer math the domain never needs.

## Consequences

- All money columns are `bigint` shillings; reads are plain `number`s, so the
  aggregation helpers in [src/server/services](../../src/server/services) and the
  UI helpers operate on them directly.
- If a future market needs a sub-unit, revisit by switching the `money()` helper
  and migrating values ×100 — isolated to one schema helper.
