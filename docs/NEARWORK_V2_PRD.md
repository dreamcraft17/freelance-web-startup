# NearWork V2 — Product Requirements Document (PRD)

**Document Version:** 1.0  
**Last Updated:** 2026-07-07  
**Author:** Dozer (CEO & Lead Engineer)  
**Status:** Implementation Planning  
**Target Release:** Q3/Q4 2026

---

## Executive Summary

NearWork V2 transisi dari **MVP+ early-access** ke **production-grade SaaS marketplace** dengan fokus pada:

1. **Monetization Engine** — Billing real-time, payment gateway (Stripe/Midtrans), invoice management
2. **Trust & Safety Scale** — Multi-level moderation, appeal workflow, automated SLA enforcement
3. **AI-Powered Matching** — Smart job-freelancer matching, recommendation engine
4. **Advanced Commerce** — Escrow/payment protection, boosted listings, analytics dashboard
5. **Realtime Infrastructure** — Live messaging, notifications, presence tracking

**Hypothesis:** Menambahkan pembayaran + AI matching akan meningkatkan job completion rate dari 65% → 85%, dan freelancer retention dari 40% → 60%.

---

## 1. Business Objectives

### 1.1 Revenue Goals
- **Commission:** 5-15% per completed contract (platform fee)
- **Subscription:** FREE / PRO / AGENCY tier dengan boost quota & features premium
- **Boost Listings:** Freelancer/client dapat pay untuk visibility (featured, top-ranked)
- **Escrow Fee:** 2% untuk payment protection (optional, opt-in)
- **Target Year 1:** 50,000 GMV (gross merchandise value), 5,000 active freelancers, 3,000 clients

### 1.2 Product Goals
- **Job completion rate:** ↑ dari 65% → 85% (via escrow + better matching)
- **Freelancer retention:** ↑ dari 40% → 60% (via trust features + analytics)
- **Platform NPS:** ≥45 (from survey)
- **Moderation SLA:** 95% reports resolved in <48hr

### 1.3 User Experience Goals
- **Mobile-first:** V2 fully responsive (V1 ada issue)
- **Messaging latency:** <200ms (realtime upgrade)
- **Job discovery:** AI recommendations dalam 24 jam setelah signup

---

## 2. Product Scope — V2 Features

### 2.1 Phase 3: SaaS & Monetization Core

#### 2.1.1 Billing & Payment Infrastructure
**User Story:** Sebagai CEO, saya ingin sistem billing production-ready sehingga revenue dapat direkap & di-forecast.

| Feature | Requirement | Priority |
|---------|-------------|----------|
| **Stripe Integration** | Webhook handling, payment intent, card tokens, automatic retry | P0 |
| **Midtrans Integration** | VA (virtual account), e-wallet, card payment, callback validation | P0 |
| **Invoice Generation** | Auto-create invoice per completed contract, downloadable PDF | P1 |
| **Payment Receipt** | Email receipt, tax line (PPN 10% untuk B2B ID), downloadable | P1 |
| **Refund Flow** | Client dapat request refund (refund reason, escrow dispute), auto-approve jika <7 hari | P1 |
| **Tax & Compliance** | Indonesia UU PDP compliance, data retention 30 days post-transaction | P2 |
| **Payout to Freelancer** | Batch payout ke rekening bank, weekly settlement, fee transparency | P0 |

**Non-Functional:**
- PCI DSS compliance (kartu ditangani Stripe/Midtrans, tidak store lokal)
- Webhook idempotency: max 1x xecution per event
- Audit trail: semua transaksi logged

#### 2.1.2 Subscription & Entitlements Management
**User Story:** Sebagai freelancer PRO, saya ingin unlimited active bids sehingga bisa mengerjakan lebih banyak project.

| Tier | Active Bids | Active Contracts | Monthly Fee | Features |
|------|------------|------------------|-------------|----------|
| **FREE** | 5 | 2 | $0 | Core bidding, messaging, review |
| **PRO** | 30 | 10 | $9.99 / Rp 160k | ↑ quota, priority support, analytics lite, custom profile URL |
| **AGENCY** | 100 | 50 | $49.99 / Rp 800k | ↑ quota, team workspace (3 seats), admin dashboard, custom branding (future) |

**Enforcement Logic:**
- Quota check at bid submission time
- Grace period: 3 days post-subscription cancel
- Downgrade: immediately revoke premium features (safe)
- Upgrade: immediately grant new quota

#### 2.1.3 Boost & Featured Listings
**User Story:** Sebagai freelancer, saya ingin boost profil saya sehingga mendapat lebih banyak job opportunities.

| Product | Price | Duration | Effect |
|---------|-------|----------|--------|
| **Boost Job (Freelancer)** | Rp 50k / $3 | 7 days | Show in "Featured" section, 50% more impressions |
| **Boost Job (Client)** | Rp 75k / $5 | 7 days | Top-ranked in search, email blast to 100 matching freelancers |
| **Featured Profile** | Rp 150k / $10 | 30 days | Sticky slot in `/freelancers` directory, badge |
| **Top Freelancer Badge** | Rp 300k / $20 | 30 days | Blue verified badge, priority in recommendations |

**Implementation:**
- Boost record dalam DB (`Boost` table: userId, type, expiresAt, cost)
- Search query rank by boost_expiry DESC
- Scheduled job: clean up expired boosts daily

---

### 2.2 Phase 4: Trust, AI, Realtime

#### 2.2.1 Escrow & Payment Protection
**User Story:** Sebagai client, saya ingin uang saya aman sampai freelancer selesai work, agar tidak khawatir di-abandon.

| Flow | Actor | Action | Holdback |
|------|-------|--------|----------|
| **Contract ACTIVE** | Client | Transfer fund ke escrow | 100% holdback |
| **Work IN_PROGRESS** | Freelancer | Submit work, ask for release | Still held |
| **Client REVIEW** | Client | Review, approve or dispute | 5 day review window |
| **COMPLETED / Dispute** | System | Release to freelancer / arbitrate | Release after approved |

**Rules:**
- Escrow fee: 2% of contract value (charged to client)
- If no action for 14 days after IN_PROGRESS: auto-release 80%
- Dispute required: photo evidence, messages, reason
- Admin mediation: arbitrate via moderation team

#### 2.2.2 AI Matching Engine (MVP)
**User Story:** Sebagai baru signup freelancer, saya ingin rekomendasi job relevant sehingga saya tidak perlu manual search.

**Recommendation Logic:**
1. Extract skill keywords dari freelancer profile (`skills[]`, portfolio, reviews)
2. Daily batch: compute relevance score per job posting
   - Skill overlap: Jaccard similarity
   - Category match: exact + parent category
   - Experience level: job difficulty vs freelancer stars
   - Location: distance scoring if hyperlocal preference
3. Top 5 jobs pushed to `/dashboard/recommendations` + email digest

**Data Model:**
```
Recommendation {
  id, freelancerId, jobId, score (0-100), 
  matchReasons: ["3 skill match", "same city"], 
  createdAt
}
```

**Metrics:**
- CTR on recommendations: target ≥ 15%
- Job view → bid rate: monitor 30%

#### 2.2.3 Advanced Moderation & Appeals
**User Story:** Sebagai freelancer di-suspend, saya ingin appeal keputusan sehingga account saya bisa di-restore.

**Moderation Levels:**

| Level | Action | Appeal Window | Escalation |
|-------|--------|---------------|-----------|
| **Warning** | Email warning, visible only to user | 7 days | → Suspension |
| **Soft Suspend** | Hide profile, disable bidding, can appeal | 7 days | → Hard suspend |
| **Hard Suspend** | Account locked, visible only to admin | 14 days | → Legal escalation |

**Appeal Workflow:**
1. Freelancer submit appeal (reason, evidence)
2. Moderation team review, interview if needed (video call)
3. Decision + notification within 5 business days
4. If approved: restore account, clear record after 1 year

#### 2.2.4 Realtime Messaging (Optional WebSocket)
**User Story:** Sebagai client, saya ingin melihat "typing..." indicator sehingga tahu freelancer sedang reply.

**MVP (v2.0):**
- Keep HTTP polling (current), 5-second interval
- Add UI: "Online" / "Last seen 2 min ago" indicator
- Add delivery status: sent / read

**Future (v2.1):** WebSocket via Socket.IO or raw ws://, but requires infra upgrade.

---

### 2.3 Phase 3-4 Admin Enhancements

#### 2.3.1 Analytics Dashboard
**User Story:** Sebagai CEO, saya ingin lihat GMV, active users, revenue per freelancer sehingga bisa forecast & optimize.

**Metrics:**
- GMV (total contract value)
- Revenue (platform commission, subscription, boost)
- Active users (monthly), retention cohort
- Job completion rate
- Moderation queue size, avg resolution time
- Fraud alerts (suspicious bidding patterns)

**Pages:**
- `/admin/analytics/overview` — dashboard realtime
- `/admin/analytics/revenue` — commission, subscription, boost breakdown
- `/admin/analytics/users` — cohort, retention, churn
- `/admin/analytics/moderation` — SLA, category breakdown, appeals rate

#### 2.3.2 Feature Flags & A/B Testing
**User Story:** Sebagai product manager, saya ingin A/B test AI recommendations sehingga bisa validate hypothesis sebelum full rollout.

**Implementation:**
- Use `@unleash/client-js` (feature flag as a service)
- Store user-level experiment assignment in DB (`UserExperiment` table)
- Flags: `ai_recommendations_enabled`, `escrow_enabled`, `new_messaging_ui`, etc.

---

## 3. Detailed User Stories & Acceptance Criteria

### 3.1 Billing & Subscription

**US-301: Stripe One-Time Payment**
- User = Client starting contract payment
- **AC:**
  - Client see payment button with contract amount + 2% escrow fee
  - Click open Stripe iframe
  - Enter card → Stripe return intent status
  - If successful: contract moves to PAYMENT_CONFIRMED, escrow initiated
  - Email receipt with invoice number, downloadable PDF
  - If fail: retry button, show error (insufficient fund, card expired, etc.)

**US-302: Subscription Upgrade**
- User = Freelancer on FREE plan
- **AC:**
  - See "Upgrade to PRO" CTA on dashboard
  - Click → checkout page (stripe or midtrans)
  - Select monthly / annual
  - Post-payment: quota updated in real-time, badge added to profile
  - Email confirmation with new limits

**US-303: Payout Request**
- User = Freelancer with ≥ Rp 100k balance
- **AC:**
  - Click "Request Payout" in wallet page
  - Select bank account (saved or new)
  - Confirm amount & fee (0.5%)
  - Sent to bank → account updated next 1-2 business days
  - Email notification when sent + when settled
  - Transaction logged in audit trail

### 3.2 Trust & Escrow

**US-401: Escrow Lock on Contract Accept**
- User = Client + System
- **AC:**
  - Client accept bid → system creates PaymentIntent (escrow, amount + 2% fee)
  - Client see "Payment Required" badge on contract
  - Client has 3 days to complete payment
  - Payment not completed → contract auto-cancel, job re-open for bids
  - Payment successful → escrow locked, freelancer notified "work start"

**US-402: Work Submission & Review**
- User = Freelancer + Client
- **AC:**
  - Freelancer click "Submit Work" on contract
  - Upload files + add message (optional)
  - Status → IN_REVIEW
  - Client see "Review Work" button, review period = 5 days
  - Client can approve / request revision / dispute
  - If approve: 80% released immediately, 20% held 7 days (chargeback protection)
  - Email notifications for each state change

**US-403: Dispute / Arbitration**
- User = Client or Freelancer
- **AC:**
  - If customer request refund/dispute within review window:
    - Submit dispute form: reason + evidence (photos, messages)
    - Auto-assign to moderator (round-robin)
    - Moderator interview both parties (optional video call)
    - Decision + explanation within 5 business days
    - If customer favor: refund issued, freelancer can appeal
    - Logged in audit trail for future dispute pattern detection

### 3.3 AI Matching

**US-501: Daily Recommendation Digest**
- User = Freelancer (any tier)
- **AC:**
  - 1x daily (9am local time), email "5 jobs we think you'd love"
  - Each job card show: title, budget, match score (85%), match reasons ("3 skill match")
  - Click → expand job detail + quick bid button
  - Track: open rate, click rate, bid rate
  - Unsubscribe link to disable digest

**US-502: Recommendation Dashboard Widget**
- User = Freelancer (dashboard)
- **AC:**
  - `/freelancer/dashboard` show "Recommended for You" section (top 5)
  - Sorted by relevance score DESC
  - Each card clickable to job detail
  - Metric: CTR, bid rate

### 3.4 Advanced Moderation

**US-601: Soft Suspend with Appeal**
- User = Freelancer suspended for violating ToS
- **AC:**
  - Email notification: "Your account has been temporarily suspended"
  - Reason + evidence (report ID, message link, etc.)
  - Appeal button in email → form
  - Submit appeal: explain, upload evidence
  - Sent to moderation team
  - Team review within 5 business days
  - Notification: "Appeal approved, account restored" or "Appeal denied, suspension remains"
  - If approved: clear record after 12 months auto-clean

**US-602: Multi-Level Appeal Review**
- User = Admin review appeal
- **AC:**
  - `/admin/appeals` show queue with sort by: newest, oldest, high priority
  - Click appeal → detail with: original report, user explanation, evidence
  - Options: approve / deny / request more info / escalate
  - If approve: auto-restore account, send approval email
  - If deny: email with final decision, cannot re-appeal within 30 days

---

## 4. Success Metrics (OKRs)

### Adoption
- DAU (daily active users): 500 → 2,000 by Q4
- Job listings: 200 → 1,000 by Q4
- Active freelancers: 500 → 5,000 by Q4

### Engagement
- Job completion rate: 65% → 85%
- Freelancer retention (month 3): 40% → 60%
- Avg messages per contract: 3 → 5

### Monetization
- GMV: $0 → $50,000 by year-end
- Revenue: $0 → $5,000 by year-end
- ARPU (average revenue per user): $0 → $1.50

### Trust & Safety
- Moderation SLA (report resolved in <48hr): 95%
- Dispute rate: <2% of contracts
- User fraud flagging: <1%

---

## 5. Out of Scope (V2)

- **Custom branding** (AGENCY tier) — defer to V2.1
- **Realtime WebSocket messaging** — use polling, upgrade in V2.1
- **Advanced analytics** (cohort, LTV) — MVP dashboard only
- **Mobile app** (iOS/Android native) — web-first, PWA later
- **Multi-currency** — USD + IDR only
- **Video escrow** — review via photo + message only
- **AI training on user data** — use third-party API (OpenAI), no custom model

---

## 6. Timeline & Milestones

| Milestone | Target | Focus |
|-----------|--------|-------|
| **M1: Payment & Subscription** | Aug 15 | Stripe + Midtrans + billing UI |
| **M2: Escrow & Trust** | Sep 15 | Escrow lock, payout, dispute flow |
| **M3: AI Matching (MVP)** | Oct 15 | Recommendation engine, daily digest |
| **M4: Moderation Phase 2** | Nov 15 | Appeal workflow, multi-level SLA |
| **M5: Analytics & Polish** | Dec 15 | Dashboard, A/B testing, bugfix |
| **Public Launch** | Jan 2027 | Full V2 GA release |

---

## 7. Dependencies & Risks

### Technical Dependencies
- **Stripe / Midtrans** — webhook setup, SDK integration
- **Payment processor** — compliance review (PCI, local regulations)
- **Database migration** — add Boost, Recommendation, Appeal tables (backcompat required)
- **Email service** — invoice PDF generation, payout notifications

### Business Dependencies
- **Marketing** — launch campaign for V2 features
- **Legal** — escrow T&Cs, Indonesia data privacy (UU PDP) review
- **Finance** — bank account setup for escrow holding, payout processor

### Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Stripe integration delay | P0 feature blocked | Start with Midtrans MVP, Stripe parallel |
| Escrow disputes spike | Support burden ↑ | Pre-write dispute criteria, auto-arbitrate rules |
| AI matching quality poor | Low adoption | A/B test with manual recommendations, iterate scoring |
| Moderation overload | SLA breach | Hire contract moderators, implement auto-classification |

---

## 8. Appendix: Glossary & Definitions

| Term | Definition |
|------|-----------|
| **GMV** | Gross Merchandise Value = sum all contract amounts |
| **Escrow** | Fund held by platform until work delivery confirmed |
| **Boost** | Paid promotion for job or freelancer visibility |
| **Moderation SLA** | Max time to resolve report (target 48hr) |
| **Chargeback** | Customer dispute via payment processor |
| **ARPU** | Average revenue per user (monthly) |
| **Cohort** | Group of users signup in same period |
| **Soft Suspend** | Temporary account disable, can appeal |
| **Hard Suspend** | Permanent account disable pending arbitration |

---

**End of PRD**  
Document prepared by: Dozer (CEO + Lead Engineer)  
Next review: 2026-08-15
