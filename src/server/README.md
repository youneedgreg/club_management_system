# `src/server` — Server-side business logic

- `actions/` — Next.js Server Actions invoked from forms/components (mutations:
  record sale, add expense, pay act, run payroll, settle credit…). Each action
  validates input with zod and is the single place authz is enforced.
- `services/` — framework-agnostic domain logic and aggregation helpers
  (tonight income, net position, payment mix, weekly P&L, payroll/commission
  math) that mirror the `reduce` logic from the prototype.

Keep React/Next imports out of `services/` so the logic stays unit-testable.
