# NextWork — Product Requirements Document (v3)

| | |
|---|---|
| **Dokumen** | PRD Lengkap: business model, users, value prop, monetization, roadmap |
| **Versi** | v3.0 |
| **Tanggal** | 26 Juli 2026 |
| **Owner** | Dozer (CEO + Tech Lead) · DN Tech |
| **Status** | MVP + V2 Foundation live · **v2.1 webhook harden implemented** · LIVE PSP Conditional |
| **Baseline** | Next.js 15 Route Handlers + PostgreSQL + Prisma · `nextwork/` |

---

## 1. Executive Summary

**NextWork** adalah marketplace hiring untuk freelancer & small projects yang menggabungkan:
- **Job posting + bidding model** (like Upwork)
- **Hyperlocal radius search** (radius + onsite filter; Upwork/Fiverr tidak ada)
- **Hybrid work support** (REMOTE, ONSITE, HYBRID; tidak seperti platform remote-only)
- **Indonesia-first positioning** (localized payments, support, compliance)

**Target:** SMEs, startups, agencies di Indonesia yang cari freelancer untuk project jangka pendek (gigs → ongoing) dengan preferensi kerja flexible.

**Differentiator:** Hyperlocal + hybrid work + trusted escrow di Indonesia pasar, di mana Fastwork focus lifestyle services dan Upwork focus high-skill remote.

**Go-live:** MVP (jobs, bids, contracts, reviews, basic trust) live. **V2.1** (payment hardening) = blocker untuk monetization. **V2.2+** (realtime, agency UX, hourly tracking) = growth features.

---

## 2. Problem Statement

### 2.1 Client perspective (hiring)

**Pain points:**
- **Finding reliable freelancer** di Indonesia sulit tanpa vetting trusted. Freelancer.com, Upwork ramai tapi banyak scam/low-quality.
- **Location matters** untuk onsite/hybrid work. Upwork tidak filter by city. Fastwork pure lifestyle services.
- **Payment risk** di marketplace tanpa strong escrow. Dana hangus, project tidak selesai.
- **No single platform** yang combine: job posting + escrow + local payment methods (e-wallet, transfer bank lokal).

### 2.2 Freelancer perspective (supply)

**Pain points:**
- **Hustle to find jobs** di Upwork/Fiverr globally competitive. Proposal susah, Connect credits mahal.
- **Opportunity mismatch** untuk onsite/hybrid work. Fastwork ada tapi lifestyle-focus. NextWork: job-based hybrid.
- **Payment friction** untuk payout di Indonesia. Local payment methods jarang.
- **Community trust** — need reputation system yang visible + fair appeals process.

### 2.3 Platform perspective

**Opportunity:**
- Indonesia freelance market growing (70M+ global, but Indonesia underserved by localized platform).
- Hyperlocal gap: no major platform optimize for city-level hiring (only remote).
- Payment infrastructure matured (Midtrans, Stripe Indonesia, e-wallet).
- Fastwork proven SE Asia model works tapi weak on escrow + job transparency.

---

## 3. Target Users & Personas

### 3.1 Client (BUYER)

**Primary:** SME owner / startup founder (Indonesia-based)
- Age 25–45, Jakarta / Surabaya / Bandung
- Budget IDR 2–50M/quarter untuk freelancer project
- Pain: "Saya mau hire freelancer tapi takut scam. Upwork terlalu ribet, Fastwork buat lifestyle."

**Secondary:** Agency project manager
- Budget allocation, need bulk hiring capability
- Repetitive projects, prefer subscription discount

**Tertiary:** Solopreneur / micro-business
- Budget IDR 500k–5M per project
- Prefer fixed-price, quick turnaround

### 3.2 Freelancer (SELLER)

**Primary:** Part-time freelancer (Indonesia-based)
- Age 22–40, side gig + full-time job
- Skills: design, content, web dev, virtual assistant
- Pain: "Banyak job listing tapi payout lama, atau scam client."

**Secondary:** Full-time freelancer
- Multiple projects, need high throughput
- Income stability important

**Tertiary:** Micro-agency / 1–2 person team
- Reselling services, need multi-seat collaboration
- Want team dashboard, shared client list

### 3.3 Admin (Platform)

- Trust & safety ops
- Moderation, reports, escalations
- Analytics, compliance (tax, payroll)

---

## 4. Core Value Propositions

### 4.1 For Clients

| Value | How | Benefit |
|-------|-----|---------|
| **Trusted escrow** | Platform holds payment until client approves work | Zero scam risk; payment protection |
| **Hyperlocal hiring** | Filter by city, radius, onsite/hybrid | Hire nearby for collaboration, onsite meetings |
| **Fast turnaround** | Job board + proposal system; visible freelancer profiles | Hire in days, not weeks |
| **Local payment** | Midtrans, e-wallet, bank transfer IDN | No forex headache, instant settlement |
| **Fair appeals** | Transparent dispute resolution + SLA | Trust in platform, not just freelancer |

**Pitch:** "Hire freelancer di Indonesia tanpa ribet. Bayar terpercaya, kerja transparan, cepat selesai."

### 4.2 For Freelancers

| Value | How | Benefit |
|-------|-----|---------|
| **Steady income** | Job board always updated; recommendations batch | More consistent project flow vs bidding hustle |
| **Payment certainty** | Escrow locked; SLA protection | Get paid, tidak ghosted |
| **Local payout** | Bank transfer, e-wallet; minimal fees | Money in pocket, tidak forex loss |
| **Reputation matters** | Reviews visible; appeals if unfair | Trust = repeat clients |
| **Community** | Verification queue + certification | Badge = premium rate |

**Pitch:** "Dapatkan project stabil dengan pembayaran terjamin. Gak perlu turun harga di Upwork bersaing global."

### 4.3 For Platform (DN Tech)

| Revenue | Model | Target |
|---------|-------|--------|
| **Subscription (PRO/AGENCY)** | Plan catalog (`SubscriptionPlan` DB) + entitlements from `plans.ts` | 5–10% of active users when paid flags on |
| **Boosts** | Featured listing; IDR 49k–149k per boost | 2–3 boosts/freelancer/month avg |
| **Recommendations** | Batch daily; premium = priority queue | Add-on to subscription |
| **Commission** | 5–8% on successful contracts (future opt-in) | Post-v2.1 |

**FY2027 target:** 10k paying clients · 50k registered freelancers · 5k active contracts/month · gross revenue IDR 500M–1B.

---

## 5. Business Model

### 5.1 Freemium subscription

Entitlements source: `packages/config/src/plans.ts` (`PLAN_ENTITLEMENTS`). Escrow timing/fees: `packages/config/src/v2-pricing.ts` (`V2_PRICING`).

| Plan | Active Bids | Active Contracts | Monthly Fee | Features |
|------|-------------|------------------|-------------|----------|
| **FREE** | 5 | 2 | IDR 0 | Core marketplace, basic profile, reviews |
| **PRO** | 30 | 10 | SubscriptionPlan catalog | Analytics (ADVANCED), boost, premium badge |
| **AGENCY** | 200 | 75 | SubscriptionPlan catalog | Analytics (AGENCY), boost, premium badge; **multi-seat workspace → v2.2 waitlist (not shipped)** |

> Subscription list prices are stored in `SubscriptionPlan` (admin catalog), not hardcoded in config. Early access may bypass quotas via `FEATURE_FREE_UNLIMITED_QUOTAS`.

**Escrow economics** (`V2_PRICING`): 2% escrow fee · 3-day payment due · 5-day client review · 80% release / 20% holdback for 7 days chargeback protection.

### 5.2 Boost products

Source: `BOOST_PRODUCT_DEFS` in `v2-pricing.ts`.

| Product | Price (IDR) | Duration |
|---------|-------------|----------|
| Job Boost (freelancer) | 50,000 | 7 days |
| Client Job Boost | 75,000 | 7 days |
| Featured Profile | 150,000 | 30 days |
| Top Freelancer Badge | 300,000 | 30 days |

### 5.3 Transaction revenue (future v2.2+)

**Commission (optional, post-launch):** 5–8% on escrow release for high-value contracts (>IDR 5M). Early freelancers exempt; roll out gradual.

### 5.4 Network economics

**Day 1 cold start:**
- Seed 50 vetted freelancers (invite-only)
- Seed 10 pilot clients (beta testers)
- Show jobs + freelancer profiles side-by-side

**Month 1:**
- 500 sign-ups (freelancers), 50 clients
- 20 active contracts, ~IDR 50M GMV

**Month 6:**
- 5k freelancers, 500 clients
- 200 active contracts, ~IDR 500M GMV

**Year 1:**
- 50k freelancers, 5k clients
- 1k+ active contracts, ~IDR 1.5B+ GMV

---

## 6. Core Features (v1–v2)

### 6.1 Marketplace (MVP)

- **Job posting:** Title, description, budget, duration, work mode (REMOTE/ONSITE/HYBRID)
- **Job discovery:** Search, filter by category, budget, location radius, work mode
- **Public profiles:** Freelancer storefront, portfolio, rate, reviews
- **Bidding:** Freelancer submit proposal, client shortlist/accept
- **Contracts:** PENDING (post-accept) → PAYMENT_PENDING → IN_PROGRESS → IN_REVIEW → COMPLETED; escrow locked after payment
- **Messaging:** Job-bound thread, file sharing, chat history
- **Ratings/reviews:** Post-contract, visible on profile
- **Saved items:** Bookmark jobs/freelancers

### 6.2 Trust & Safety (v1.5)

- **Report intake:** Job/profile report, SLA tracking
- **Moderation queue:** Admin assign, resolve
- **Verification queue:** Approve freelancer profiles
- **Appeals:** Freelancer/client appeal unfair rating/job hide
- **Admin analytics:** SLA dashboard, report trends, compliance audit
- **Notifications:** Unread badges, in-app alerts

### 6.3 V2 Foundation (live)

- **Escrow domain:** PaymentIntent + PaymentTransaction + EscrowTransaction; 5d review / 80–20 release per `V2_PRICING`
- **Boosts:** Featured job/profile products per `BOOST_PRODUCT_DEFS`
- **Recommendations:** Batch daily: "jobs you might bid on" (freelancer), "freelancer matches" (client)
- **Wallet / payout:** Batch payout to bank (MOCK, v2.1 will harden)
- **Subscriptions:** FREE → PRO → AGENCY tiers (quotas from `plans.ts`; multi-seat AGENCY UX deferred v2.2)
- **PSP integration:** Stripe + Midtrans (MOCK, v2.1 will verify)

---

## 7. Competitive Positioning

| Platform | Model | Strength | Weakness vs NextWork |
|----------|-------|----------|---------------------|
| **Upwork** | Proposal (bid) + hourly | Global scale, hourly tracking, AI matching | Remote-only, high fees (5–20%), Indonesia payout friction |
| **Fiverr** | Gig catalog (fixed-price) | Creator-friendly, easy listing | Passive discovery, seller not buyer-driven, no hourly |
| **Fastwork** | Hybrid (catalog + custom) | SE Asia local, lifestyle services | Weak escrow, no job transparency, lifestyle-not-job-focused |
| **Freelancer.com** | Proposal (bid) + contest | Cheap, high volume | Low quality, scam-heavy, poor dispute resolution |

**NextWork:** Job posting + bid + hyperlocal + escrow + Indonesia-first = **unique niche for SME + hybrid work in Indonesia**.

---

## 8. Roadmap (v2–v4)

### v2.0 (Current)
- ✅ MVP marketplace (jobs, bids, contracts)
- ✅ Escrow foundation
- ✅ Reviews, trust, appeals
- ✅ i18n EN/ID

### v2.1 (Q3 2026 — BLOCKER)

- ✅ **Payment hardening:** Webhook HMAC verify (Stripe) + Midtrans signature required, unit tests, [PAYMENT-RUNBOOK.md](../PAYMENT-RUNBOOK.md)
- 🔄 Invoice PDF (optional)
- 🔄 Chargeback hold procedures (ops)
- 🔄 Go-live runbook execution (enable paid flags, pilot txs) — Conditional on keys

### v2.2 (Q4 2026)
- 🔄 WebSocket realtime chat (replace polling)
- 🔄 Agency multi-seat UX (team dashboard, roles, bulk ops) — **waitlist; not in current release**
- 🔄 Hourly work tracking (time diary, desktop app)
- 🔄 Commission collection (5–8% on escrow release)

### v3.0 (Q1 2027)
- Mobile app (iOS/Android, Expo)
- AI real-time matching (freelancer suggestions for jobs)
- Quality tiers (Pro, Certified, Expert badges)
- SaaS integrations (Slack, Google Drive, Zapier)

### v4.0 (Q2 2027+)
- Public API for partners
- Subscription/recurring contracts
- Payroll integration (for full-time freelancers as contractors)
- Video interview built-in

---

## 9. Success Metrics (v2.1+)

| KPI | Target | Tracking |
|-----|--------|----------|
| **DAU / MAU** | 500 / 3k by end Q3 2026 | Analytics dashboard |
| **Successful contracts/month** | 50 by end Q3, 200 by Q4 | Contract completion rate |
| **GMV (Gross Merchandise Value)** | IDR 100M by end Q3, 500M by Q4 | Payment volume |
| **Commission revenue** | IDR 5M/month (v2.2+) | Payout history |
| **Freelancer retention** | >60% repeat bidders | Cohort analysis |
| **Client repeat rate** | >50% hire >1 project | Repeat contracts |
| **Net Promoter Score (NPS)** | >40 | Monthly survey |
| **Support response time** | <4 hours (P0 reports) | SLA tracking |

---

## 10. Go-to-Market (v2.1+)

### Phase 1: Beta (Jakarta hyperlocal)
- Target: 500 freelancers + 50 clients
- Channel: LinkedIn, community groups (Twitter X), direct outreach
- Incentive: Free PRO for 3 months (first 100 sign-ups)
- Focus: Early adopters, feedback loop

### Phase 2: Regional expansion (Surabaya, Bandung, Medan)
- Replicate beta playbook in 3–4 cities
- Target: 5k freelancers, 500 clients

### Phase 3: National + PR push
- Press: "Indonesia marketplace vs Upwork, local first"
- Partnerships: Co-working spaces, StartupLokal, accelerators
- Targeting: SME associations, agency networks

### Phase 4: Performance marketing (Q1 2027)
- Google Ads (job search keywords: "freelancer Indonesia", "hire designer Jakarta")
- TikTok/IG organic (success stories, freelancer testimonials)

---

## 11. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Payment fraud** | Revenue loss, user trust | HMAC webhook verify (v2.1), chargeback hold, manual review >IDR 5M |
| **Low quality freelancer** | Client churn | Verification queue, reviews visible, appeals process |
| **Network effects slow** | Cold start fails | Seed freelancers, invite-only first, community seeding |
| **Competition from Upwork** | Price pressure | Hyperlocal positioning, local payment, Indonesia support |
| **Regulation (tax, labor)** | Compliance cost | Monitor PP 65 (PTKP), work with accountant, clear ToS |

---

## 12. Dependencies

- **Worker process** (`apps/worker`) for escrow auto-release, recommendations, payout batch, moderation SLA
- **Stripe + Midtrans API keys** for v2.1 (separate staging/prod)
- **PostgreSQL 15+** (RLS for multi-tenant if AGENCY tier expands)
- **Email provider** (SendGrid or local) for notifications
- **Admin panel** (placeholder in v1, iterate in v2+)

---

## 13. Success Criteria (v2.1 sign-off)

1. ✅ Webhook HMAC verified + tested (negative tests pass)
2. ✅ Reconciliation logic (PSP ↔ DB) passes audit
3. ✅ Runbook written + ops team trained
4. ✅ 3 pilot transactions successful (end-to-end)
5. ✅ Payment mode flipped to LIVE (not MOCK)
6. ✅ Legal: ToS updated with payment T&Cs
7. ✅ Support: "payment dispute" playbook documented

---

## 14. Document control

| Version | Date | Author | Change |
|---------|------|--------|--------|
| v1.0 | Jun 2026 | Dozer | Initial (focused on features) |
| v2.0 | Jun 2026 | Dozer | Added roadmap + business model |
| v3.0 | Jul 26 2026 | Dozer | Code-as-truth sync: plans.ts quotas, v2-pricing escrow/boost, AGENCY multi-seat → v2.2 |

---

**Next steps:** Align with SDD (architecture) + SRS (feature specs) before sprint planning.
