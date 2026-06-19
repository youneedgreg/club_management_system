# Black Stars — Services & Costs

A checklist of everything you'd need (and pay for) to take the app from a static
file to a full club management system with notifications, email, and AI.
Prices are estimates for a club of ~200 members. Last reviewed: 2026-06-19.

---

## 1. Required to use ANY paid API (do this first)

- [ ] **Backend hosting** — Vercel / Render functions (run server code, hide keys)
      → Free tier · ~$20/mo at scale
- [ ] **Database** — Supabase or Neon Postgres (members, payments, kitchen, payables)
      → Free tier · ~$25/mo at scale
- [ ] **Auth** — Clerk or Supabase Auth (member/admin logins)
      → Free tier · ~$20/mo at scale

---

## 2. Notifications — Twilio

- [ ] **Phone number** — ~$1–2/month
- [ ] **SMS to Kenya** — ~$0.02–0.06 per message
- [ ] **WhatsApp** (cheaper) — ~$0.005–0.04 per conversation
      → ~200 members × 4 msgs/mo ≈ **$15–50/mo** on SMS, less on WhatsApp

## 3. Email — Resend

- [ ] **Free tier** — $20/month for 50,000 emails (only if you outgrow free)

## 4. AI — Claude API (cheapest of the four)

Billed per token (~750k words per 1M tokens). Pick the model per task:

- [ ] **Haiku 4.5** — $1 in / $5 out per 1M tokens → cheap routine work, classification
- [ ] **Sonnet 4.6** — $3 in / $15 out per 1M tokens → summaries, insights
- [ ] **Opus 4.8** — $5 in / $25 out per 1M tokens → complex analysis

Your insight snippets are tiny → **under $5/mo** on Haiku even at 1,000 calls.

---

## 5. Optional / nice-to-have

- [ ] **Custom domain** (e.g. blackstars.co.ke) — ~$12/year
- [ ] **Real online payments** (actual M-Pesa/Stripe charges) — ~1.5–3% per transaction
      (only if you process payments, not just record them)

---

## Monthly total estimates

| Tier                                            | Cost / month |
| ----------------------------------------------- | ------------ |
| Starting out (free tiers, SMS only when needed) | **~$15–55**  |
| WhatsApp instead of SMS                         | **~$5–25**   |
| At real scale (paid DB + hosting + heavier SMS) | **~$80–150** |

**Takeaway:** Twilio SMS dominates the cost. Resend, Claude AI, hosting, and the
database all sit in free tiers at club scale. AI is the _cheapest_ of the four.
