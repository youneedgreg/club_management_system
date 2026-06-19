# Black Stars — Club Management System · Build Tasks

A phased plan to build the **Black Stars** lounge & nightclub management system in
**Next.js (App Router)**, taking it from the static HTML prototype in `black stars html/`
to a production system with database, auth, payments, notifications, and AI.

**Stack (target):** Next.js 16 (App Router) · TypeScript · Tailwind CSS · shadcn/ui ·
Postgres (Supabase/Neon) · Drizzle or Prisma ORM · Clerk or Supabase Auth ·
Resend (email) · Twilio (SMS/WhatsApp) · Claude API (AI) · M-Pesa Daraja · Vercel (hosting).

**Currency:** KES throughout. **Locales:** `en`, `fr`, `ar` (Arabic = RTL).

Legend: `[ ]` todo · `[~]` in progress · `[x]` done. Each phase is shippable.

---

## Phase 0 — Project Foundation & Tooling

- [x] Scaffold Next.js app (`create-next-app`, App Router, TypeScript, ESLint, Tailwind, `src/` dir, alias `@/*`)
- [x] Configure `tsconfig` strict mode, path aliases
- [x] Set up ESLint + Prettier (+ Tailwind plugin) and a `format`/`lint` script
- [x] Set up Git hooks (lint-staged + husky) for pre-commit lint/format
- [x] Install `shadcn/ui` and initialize (theme tokens, `components.json`)
- [x] Add `.env.example` documenting every key (DB, auth, Resend, Twilio, Claude, M-Pesa)
- [x] Set up environment config loader with typed/validated env (e.g. `zod` + `@t3-oss/env-nextjs`)
- [x] Create folder structure: `app/`, `components/`, `lib/`, `db/`, `server/` (actions/services), `i18n/`, `types/`
- [x] Add base `README` dev instructions; wire `SERVICES_AND_COSTS.md` decisions into env setup
- [x] Decide and document: ORM (Drizzle), Auth (Neon Auth / Stack Auth), DB (Neon) — recorded in `docs/decisions/0001-stack-foundations.md`

---

## Phase 1 — Design System & App Shell

Port the look/feel from the prototype (`app.jsx`, `ui.jsx`, `icons.jsx`, screenshots in `black stars html/screens/`).

- [ ] Define design tokens as CSS variables: gold palette, surfaces, text/faint, green/red/blue/violet, mpesa color, lines (dark + light themes)
- [ ] Port typography (display font + body font) and base global styles
- [ ] Theme provider: dark/light toggle, persisted (was `bs_theme` in localStorage), `data-theme` on `<html>`
- [ ] Build icon set (port `icons.jsx`) or adopt `lucide-react` equivalents (star, dashboard, stock, income, expenses, pot, calendar, credit, banknote, staff, reports, settings, sparkles, etc.)
- [ ] Reusable UI primitives (port `ui.jsx`): `Page`, `Card`, `CardTitle`, `Stat`, `Money`, `Chip`, `IcChip`, `Seg` (segmented control), `Toast`, `Modal`/`Sheet`, badges
- [ ] Money/number formatting helpers (`money`, `moneyK`) — KES, thousands separators
- [ ] Chart primitives: bar chart (`WeekBars`), sparkline (`Spark`), hourly bars, donut/category splits (use Recharts or hand-rolled SVG to match prototype)
- [ ] **App shell layout:** desktop sidebar nav, mobile top bar, mobile bottom nav (4 primary + "More" sheet)
- [ ] Nav config with badge counts (low-stock count, overdue-credit count)
- [ ] Active-route highlighting + persisted last view; routing via App Router segments
- [ ] Global "live" pill (open/close hours), search box, notifications bell, user/account chip
- [ ] Responsive breakpoints verified against screenshots (`dash.png`, `dash2.png`, etc.)

---

## Phase 2 — Internationalization (EN / FR / AR + RTL)

- [ ] Choose i18n approach (`next-intl` recommended for App Router) and wire middleware/locale routing
- [ ] Port all translation strings from `i18n.js` (en/fr/ar) into message catalogs
- [ ] Locale switcher component (flag, native name, English name) — persisted (was `bs_lang`)
- [ ] Set `<html lang>` and `dir` (LTR/RTL) per locale; verify Arabic RTL layout
- [ ] RTL-safe styles (use logical properties: `margin-inline`, `padding-inline`, etc.)
- [ ] Translate role labels (supervisor, cashier, bartender, waiter, security, dj, MC, host) and category keys
- [ ] Locale-aware number/date formatting

---

## Phase 3 — Database & Data Layer

Model the domain from `data.js`. All money in KES (store as integers/minor units or numeric).

- [ ] Provision Postgres (Supabase or Neon via Vercel Marketplace); wire connection string
- [ ] Set up ORM + migrations; seed script that loads the `data.js` dataset for dev
- [ ] **Schema — core/meta:** `clubs` (name, tagline, location, owner, hours, currency, mpesa paybill)
- [ ] **Schema — inventory:** `products`/`stock` (name, category, unit, onHand, par, cost, sell, supplier ref, delivered)
- [ ] **Schema — sales:** `sales` (time, location/table, description, payment method, amount), `sale_items` (link to products), staff attribution
- [ ] **Schema — categories:** income categories, expense categories (bar + kitchen)
- [ ] **Schema — expenses:** `expenses` (label, category, amount, recurring, timestamp, domain=bar|kitchen)
- [ ] **Schema — kitchen:** `kitchen_orders` (time, table, item, qty, amount, status: preparing/served), kitchen income/expense categories
- [ ] **Schema — credit (Deni):** `credit_customers` (name, note, phone, balance, age/aging, lastPaid), `credit_payments`
- [ ] **Schema — suppliers/payables:** `suppliers` (name, category, owed, lastOrder, dueDate, terms, phone, aging), `supplier_payments`
- [ ] **Schema — staff:** `staff` (name, role, type: tonight|permanent|casual), `attendance` (status, clock-in), `staff_permanent` (salary, NHIF, NSSF, PAYE, advance, pay status), `staff_casuals` (dailyRate, daysWorked, deduction, advance, posLinked, posSales, commissionPct), `advances`
- [ ] **Schema — lineup:** `bookings` (date, label, flagship, name, role, time, feeType fixed|pct, fee, pct, guest), `booking_payments` (amount, method, mpesa code, receipt, time)
- [ ] **Schema — reporting aggregates:** nightly P&L snapshots, monthly trend (or compute via queries/materialized views)
- [ ] Data-access layer: typed query functions / repositories per domain
- [ ] Server-side aggregation helpers (tonight income, net position, payment mix, weekly P&L, margins) — mirror the in-app `reduce` logic from the prototype
- [ ] Seed realistic dataset; verify counts/totals match prototype

---

## Phase 4 — Authentication & Authorization

- [ ] Integrate Auth provider (Clerk or Supabase Auth); sign-in / sign-up flows
- [ ] Protect app routes via middleware; redirect unauthenticated users
- [ ] Roles & permissions model: owner/admin vs staff (cashier, supervisor) — gate sensitive modules (payables, staff salaries, settings)
- [ ] User/account chip wired to real session (avatar, name, account menu, sign-out)
- [ ] Multi-tenant scoping by `club` (future-proof for >1 venue)
- [ ] Audit considerations: who recorded a payment / expense / advance

---

## Phase 5 — Dashboard Module

Ref: `Dashboard` in `modules_a.jsx`, screenshots `dash.png` / `dash2.png`.

- [ ] Net position card (income − expenses) with delta vs yesterday + "floor is busy" chip
- [ ] Tonight income, tonight expenses, entries (door) cards with deltas
- [ ] Average spend per entry computation
- [ ] Hourly revenue bar chart (`byHour`)
- [ ] Top sellers list with unit bars (`topSellers`)
- [ ] Low-stock alert list (sorted by onHand/par ratio) with quick link to Stock
- [ ] Recent sales feed (newest first, payment-method tags)
- [ ] Wire all figures to live DB queries (no static data)

---

## Phase 6 — Bar Stock / Inventory Module

Ref: `BarStock` in `modules_a.jsx`, `01-list.png`.

- [ ] Stock table/grid: name, category, unit, onHand/par, cost, sell, supplier, delivered date
- [ ] Low-stock highlighting + reorder suggestion (onHand < par); sidebar badge count
- [ ] Category filters (spirits, beer, wine, soft, shisha, cigarettes)
- [ ] Add / edit / adjust stock (receive delivery, set par, manual count) — server actions
- [ ] Margin display (sell − cost) per item
- [ ] Stock depletion driven by recorded sales (link sales → stock movements)
- [ ] Reorder action that can draft a supplier order (ties into Payables/notifications later)

---

## Phase 7 — Income Module

Ref: `Income` in `modules_a.jsx`, `pay.png` / `pay2.png` / `pct.png`.

- [ ] Income by hour chart + total
- [ ] Income by category breakdown (spirits, wine, beer, shisha, soft, door/cover)
- [ ] Payment mix (M-Pesa / cash / card) with % and amounts
- [ ] Live sales feed with payment tags
- [ ] **Record a sale** form: table/bar/door, items, amount, payment method, staff attribution
- [ ] Auto-attribute sales to casual staff (POS feed → commission), see `posFeed`
- [ ] Filter by date / shift; totals recompute server-side

---

## Phase 8 — Expenses Module (Bar)

Ref: `Expenses` + `ExpenseForm` in `modules_a.jsx`.

- [ ] Expenses-tonight list (label, category, amount, recurring flag, time)
- [ ] Expense mix by category chart (monthly)
- [ ] Add-expense form (label, category, amount, recurring toggle) — server action + toast
- [ ] Edit / delete expense
- [ ] Categories: suppliers, wages, entertainment, rent/license, security, utilities, misc
- [ ] Recurring expense handling (template / auto-suggest)

---

## Phase 9 — Kitchen Module (Food side)

Ref: `Kitchen` in `modules_d.jsx`. Separate income & expenses from the bar.

- [ ] Kitchen income by category (grills, main course, snacks/sides, soups/stews, desserts)
- [ ] Kitchen revenue by hour chart
- [ ] Live orders list with status (preparing → served), table, item, qty, amount
- [ ] Order status update action (kitchen ticket flow)
- [ ] Kitchen expenses (ingredients, kitchen wages, gas, packaging, maintenance) + add form
- [ ] Kitchen P&L summary (food income − food expenses), kept distinct from bar

---

## Phase 10 — Lineup / Bookings Module

Ref: `Lineup`, `BookingForm`, `PayModal` in `modules_c.jsx`, `wk.png`, `modal.png`/`modal2.png`. Most complex module.

- [ ] Multi-week calendar view (week navigation, day cards, closed days, flagship night badge)
- [ ] Booking cards: act name, role (DJ/MC/host), set time, fee, paid/partial/unpaid status, guest flag
- [ ] Role color coding (DJ=gold, MC=blue, host=violet)
- [ ] **Fee types:** fixed fee AND percentage-of-night (`feeType: pct`, `pct`) — compute pct fee from night income
- [ ] **Booking form:** add act (name, role, date, time, fee or %), validation
- [ ] **Pay modal:** record payment(s) — partial payments supported, running balance, M-Pesa code capture, generate receipt
- [ ] Payment history per booking (add/remove payment), total paid vs fee
- [ ] Paid / unpaid / partial filters and totals owed to acts

---

## Phase 11 — Credit (Deni) Module

Ref: `Credit` in `modules_b.jsx`, `01-led.png`/`02-led.png`.

- [ ] Credit ledger list: customer, note, masked phone, balance, aging (days), last paid
- [ ] Overdue highlighting (age > 7 days) + sidebar badge count
- [ ] Record repayment (reduces balance, updates lastPaid, resets aging)
- [ ] Add new credit customer / new tab
- [ ] Send reminder action (hooks into SMS/WhatsApp in Phase 14)
- [ ] Total outstanding summary

---

## Phase 12 — Payables / Suppliers Module

Ref: `Suppliers` + `SupplierPayModal` in `modules_d.jsx`.

- [ ] Suppliers list: name, category (drinks/food/utilities/services), owed, last order, due date, terms, phone, aging
- [ ] Due-soon / overdue highlighting by due date
- [ ] **Supplier pay modal:** record payment against balance (full/partial), method, reference
- [ ] Payment history per supplier
- [ ] Total payables + breakdown by category
- [ ] Link to Stock reorder (drafted orders increase payable on delivery)

---

## Phase 13 — Staff Module (Tonight / Permanent / Casuals)

Ref: `Staff`, `StaffTonight`, `StaffPermanent`, `StaffCasuals`, `AdvanceModal` in `modules_b.jsx`. Tabbed.

- [ ] Tabbed layout: Tonight · Permanent · Casuals
- [ ] **Tonight roster:** present/absent status, clock-in time, role, wage; mark attendance
- [ ] **Permanent staff:** salary + statutory deductions (NHIF, NSSF, PAYE), advances, net pay, pay status (pending/paid); mark paid / run payroll
- [ ] **Casuals:** daily rate × days worked, deductions, advances, POS-linked commission (posSales × commissionPct)
- [ ] Live POS feed showing sales attributed to casual staff + commission earned
- [ ] **Advance modal:** record salary advance against a staff member (updates balances)
- [ ] Net pay calculations verified against prototype math
- [ ] Roles i18n (supervisor, cashier, bartender, waiter, security, dj)

---

## Phase 14 — Reports & End-of-Night

Ref: `Reports` in `modules_b.jsx`, `ar.png`.

- [ ] End-of-night hero: club, date, revenue / costs / profit / margin / footfall
- [ ] Weekly P&L bar chart (revenue vs cost per day, closed days, best night)
- [ ] Monthly revenue trend sparkline + recent-months breakdown (partial-month flag)
- [ ] **Export PDF** of nightly report (server-generated)
- [ ] **Share to WhatsApp** (formatted summary message / link)
- [ ] Date-range report selection; nightly snapshot persisted at close

---

## Phase 15 — Settings Module

Ref: `Settings` in `modules_b.jsx`.

- [ ] Club profile card (name, location, open/now status)
- [ ] Appearance: theme segmented control (dark/light)
- [ ] Language selector (en/fr/ar with dir)
- [ ] Business profile: currency, low-stock threshold (par level), nightly close time, M-Pesa paybill
- [ ] Notification preferences (low stock, deni/credit, nightly close, daily summary) — persisted
- [ ] Manage users/roles (admin only)

---

## Phase 16 — Notifications (Twilio SMS / WhatsApp + Resend Email)

Ref: `SERVICES_AND_COSTS.md` §2–3.

- [ ] Twilio integration (phone number, SMS + WhatsApp sender) behind server actions
- [ ] Credit reminder messages (Deni) — manual send + templates
- [ ] Supplier payment-due reminders
- [ ] Low-stock alert notifications (respecting Settings prefs)
- [ ] Resend email integration: nightly summary email, receipts
- [ ] Notification log / delivery status; rate-limit & cost guardrails
- [ ] Respect notification preference toggles from Settings

---

## Phase 17 — Payments (M-Pesa Daraja)

Ref: Settings M-Pesa paybill 247247; `SERVICES_AND_COSTS.md` §5.

- [ ] Integrate M-Pesa Daraja (STK push) for recording real payments (optional/feature-flagged)
- [ ] Reconcile M-Pesa transactions against sales / lineup / credit / payables
- [ ] Capture & verify M-Pesa codes on payments (already modeled in lineup pay modal)
- [ ] Webhook/callback handling + idempotency
- [ ] Card / cash manual entry paths remain first-class

---

## Phase 18 — AI Assistant (Claude API)

Ref: `AIPanel` in `app.jsx`, `SERVICES_AND_COSTS.md` §4. Replace mock answers with real LLM.

- [ ] AI panel UI (FAB + slide-over) ported, with suggested-question chips
- [ ] Server route calling Claude API (default Haiku 4.5 for cheap routine insights; Sonnet for summaries)
- [ ] Tool/context layer: feed live aggregates (payment mix, low stock, outstanding credit, weekly P&L) so answers are grounded in real data
- [ ] Stream responses; loading/typing states
- [ ] Guardrails: scope to club data, disclaimer, cost caps, input validation
- [ ] Natural-language Q&A over the dataset (e.g. "what's overdue?", "are we profitable this week?")

---

## Phase 19 — Quality, Testing & Hardening

- [ ] Unit tests for money/aggregation/payroll/commission/pct-fee calculations
- [ ] Component tests for key UI (charts, forms, modals)
- [ ] Integration tests for server actions (record sale/expense/payment, run payroll)
- [ ] E2E happy paths (record a night, pay an act, settle credit) — Playwright
- [ ] Accessibility pass (keyboard nav, focus traps in modals/sheets, contrast, RTL)
- [ ] Security review: authz on every mutation, input validation (zod), secrets handling, OWASP basics
- [ ] Performance: server components / caching for dashboards, query optimization, bundle size
- [ ] Error handling, empty states, optimistic UI + toasts, loading skeletons

---

## Phase 20 — Deployment & Operations

Ref: `SERVICES_AND_COSTS.md` §1.

- [ ] Deploy to Vercel; configure env vars per environment (preview/prod)
- [ ] Production database + automated backups
- [ ] Custom domain (e.g. blackstars.co.ke) + HTTPS
- [ ] Logging / monitoring / error tracking (e.g. Vercel + Sentry)
- [ ] Analytics & uptime checks
- [ ] CI: lint + typecheck + test on PR; preview deploys
- [ ] Seed/migration runbook; rollback plan
- [ ] Cost monitoring (Twilio dominates — alert thresholds)
- [ ] Final QA against all prototype screens in EN/FR/AR, dark & light, mobile & desktop

---

## Suggested build order (MVP first)

1. Phases **0–3** (foundation, shell, i18n, DB) — the platform.
2. Phases **5, 7, 8, 6** (Dashboard, Income, Expenses, Stock) — the nightly core.
3. Phase **4** (Auth) — before going live.
4. Phases **11, 12, 13** (Credit, Payables, Staff) — the money owed/owing.
5. Phases **9, 10, 14, 15** (Kitchen, Lineup, Reports, Settings).
6. Phases **16–18** (Notifications, Payments, AI) — paid integrations.
7. Phases **19–20** (Hardening, Deploy).
