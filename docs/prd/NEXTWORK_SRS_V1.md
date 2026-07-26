# NextWork — Software Requirements Specification (v1)

| | |
|---|---|
| **Dokumen** | Detailed feature specs, user stories, acceptance criteria |
| **Versi** | v1.0 |
| **Tanggal** | 26 Juli 2026 |
| **Owner** | Dozer (Product + Tech Lead) · DN Tech |
| **Focus** | MVP + V2 foundation; ready for v2.1 sprint planning |

---

## 1. Overview

This SRS maps **NextWork features** to **user stories** with **acceptance criteria**. Organized by feature area, with security, performance, and ops notes.

**Definition of Done** (all stories):
1. ✅ Acceptance criteria testable (API + UI)
2. ✅ Unit tests (crypto, core logic)
3. ✅ E2E smoke test (not regress)
4. ✅ Living docs updated: FEATURE-CATALOG, CHANGELOG, Doc revision bumped
5. ✅ Security review: no secrets in client, no seed→prod
6. ✅ Ops documented: deployment steps, env vars needed, migration scripts

---

## 2. Authentication & Session Management

### Story 2.1: User Registration

**Title:** Register new user (client/freelancer)

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Valid email + password | User submits email + password; system validates format; returns error if invalid |
| AC2: Unique email check | If email exists → error "Email already registered" |
| AC3: Password hashing | Password never stored plaintext; bcrypt cost 12 |
| AC4: Email verification (future) | Send confirmation email; link valid 24h (v2.2 when email working) |
| AC5: Role selection | User picks CLIENT or FREELANCER at signup; stored in User.role |
| AC6: Session cookie | After successful register → JWT cookie `acme_session` (HttpOnly, Secure in prod, SameSite=Lax, Max-Age=7d) |
| AC7: CSRF token | Response includes X-CSRF-Token for mutations |
| AC8: Rate limit | 5 registrations per IP per minute; return 429 if exceeded |
| AC9: Response** | `{ user: { id, email, role }, token, csrf_token }` (no password hash) |

**API:**
```
POST /api/auth/register
body: { email, password, role: CLIENT | FREELANCER }
response: 201 { user, token, csrf_token }
error: 400 (validation), 409 (email exists), 429 (rate limit)
```

**Spec notes:**
- Email lowercase before validation
- Password min 8 chars, must contain uppercase + number
- Don't log password anywhere

---

### Story 2.2: User Login

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Valid email + password | Submit credentials; validate both required |
| AC2: Email lookup | Case-insensitive email search |
| AC3: Password comparison | bcrypt.compare(); return "Invalid email or password" if mismatch (don't reveal which) |
| AC4: Session creation | Successful login → JWT (7-day expiry) in cookie |
| AC5: CSRF token | Response includes X-CSRF-Token |
| AC6: Rate limit | 5 login attempts per IP per minute; 429 after |
| AC7: Brute force protection | After 10 failed logins per account, lock 15 min (future: email notification) |
| AC8: Response** | `{ user: { id, email, role, profile }, token, csrf_token }` |

**API:**
```
POST /api/auth/login
body: { email, password }
response: 200 { user, token, csrf_token }
error: 401 (invalid), 429 (rate limit)
```

---

### Story 2.3: Session Management (Logout, Refresh)

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Logout | POST /api/auth/logout; clear cookie, invalidate token |
| AC2: Refresh token | POST /api/auth/refresh; valid JWT → new JWT (no cookie refresh if not close to expiry) |
| AC3: Session check | GET /api/auth/session; return current user + role, or 401 if expired |
| AC4: CSRF validation | All POST/PATCH/DELETE require X-CSRF-Token header |
| AC5: HttpOnly cookie** | Cookie not accessible to JS; XSS attack can't steal |

---

## 3. Job Marketplace

### Story 3.1: Post a Job (Client)

**Title:** Client creates job listing

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Job form fields | Title (required, max 100 chars), description (required, max 5000), budget_min/max (IDR, required), category (required, enum), work_mode (REMOTE/ONSITE/HYBRID), location (city + lat/lng if ONSITE/HYBRID), radius_km (optional, 1–50), attachments (optional, max 3 files, max 10MB each) |
| AC2: Budget validation | budget_min ≤ budget_max; both > IDR 0 |
| AC3: Location validation | If ONSITE/HYBRID: city required; lat/lng required (from Google Maps autocomplete) |
| AC4: Quota check | FREE plan: max 5 open jobs; PRO: unlimited; AGENCY: unlimited |
| AC5: Job status** | New job status = OPEN; expires_at = now() + 30 days (customizable? v2.2) |
| AC6: Freelancer visibility | Job visible on /jobs board if status = OPEN |
| AC7: Notification | In-app notification to nearby freelancers (radius match) + email if subscribed (future) |
| AC8: Metadata | Store created_at, user_id, updated_at; track view count |

**API:**
```
POST /api/jobs
body: {
  title, description, budget_min, budget_max, category, work_mode,
  location?, radius_km?, attachments?
}
auth: CLIENT
response: 201 { job }
error: 400 (validation), 403 (quota exceeded), 401 (not authenticated)
```

**UI Spec:**
- Form has 5 steps (not full-page form; reduce abandonment)
- Step 1: Title + description
- Step 2: Budget + category
- Step 3: Work mode + location (if ONSITE/HYBRID, Google Maps autocomplete)
- Step 4: Attachments
- Step 5: Review + publish
- Draft autosave every 30s to localStorage

---

### Story 3.2: Search & Filter Jobs

**Title:** Freelancer searches for jobs on board

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Search bar | Text input; searches title + description (substring match) |
| AC2: Category filter | Multi-select; AND logic (job must match all selected) |
| AC3: Budget filter | Range slider (IDR 100k–50M); filters by budget_min ≤ job_max AND budget_max ≥ job_min |
| AC4: Work mode filter | Checkboxes: REMOTE, ONSITE, HYBRID; OR logic |
| AC5: Hyperlocal filter | Checkbox "Near me"; uses browser geolocation; shows jobs within freelancer's location + radius_km (city-level first, then radius) |
| AC6: Sorting | Dropdown: Newest (default), Highest Budget, Ending Soon, Relevance |
| AC7: Pagination | 20 jobs per page; "Load more" button |
| AC8: URL state** | Filters encoded in URL query params (shareable); deep links work |
| AC9: Performance | Search returns <500ms; results cached 5 min |
| AC10: No results state | If zero results → show "No jobs match your filters. Try adjusting." + suggest popular searches |

**API:**
```
GET /api/jobs?search=&category=&budget_min=&budget_max=&work_mode=&location=&radius_km=&sort=&page=
response: 200 {
  jobs: [ { id, title, budget_min/max, category, work_mode, location, bid_count, created_at, ... } ],
  total, page, limit
}
```

**Caching:**
- Redis cache (5 min) for public search results
- Invalidate on job create/update

---

### Story 3.3: Job Detail Page

**Title:** Freelancer views job details & can bid

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Job header** | Title, budget range, category badge, posted date, view count |
| AC2: Description** | Full description, attachments (preview + download link) |
| AC3: Client preview** | Client name (not email), verification status badge (if verified), short review snippet (avg rating) |
| AC4: Bid section** | "Place a bid" button (if freelancer logged in); shows existing bids count (if client) |
| AC5: Bid list** | If freelancer = job owner (client), show all bids with proposal text (oldest first); not if freelancer |
| AC6: Related jobs** | Show 3–5 similar jobs (same category, similar budget) |
| AC7: Share** | Share button (copy link, Twitter, LinkedIn) |
| AC8: Save job** | Freelancer can bookmark job; heart icon, toggles on click |
| AC9: Report** | Freelancer can report job if suspicious (reason dropdown: scam, low payment, unclear brief, ...); success message "Thanks for reporting" |
| AC10: Mobile optimized** | Stack sections vertically; sticky "Place a bid" button at bottom |

**API:**
```
GET /api/jobs/:jobId
response: 200 {
  job: { id, title, description, ..., bid_count, view_count },
  bids: [ { id, freelancer: { name, rating }, proposal, bid_amount }, ... ] OR empty array (if not owner),
  client: { name, verification_status, avg_rating, total_jobs, ... },
  relatedJobs: [ ... ]
}
```

---

## 4. Bidding & Contracts

### Story 4.1: Freelancer Submits Bid

**Title:** Freelancer proposes for a job

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Bid form** | Proposal text (required, max 1000 chars), bid_amount (required, IDR, must be ≤ job budget_max), bid_timeline (required, 1–90 days) |
| AC2: Quota check** | FREE: max 5 active bids / 2 active contracts; PRO: 30/10; AGENCY: 200/75 (`packages/config/src/plans.ts`); enforced when `FEATURE_FREE_UNLIMITED_QUOTAS` is off |
| AC3: Duplicate bid** | Freelancer already bid on this job → show "You've already bid on this job. Edit your bid instead?" + link to edit |
| AC4: Validation** | bid_amount must be > 0; bid_timeline must be 1–90 |
| AC5: Bid save** | Create Bid record (status = PENDING); send notification to client: "New bid from [freelancer]" |
| AC6: Response** | `{ bid: { id, proposal, bid_amount, bid_timeline, created_at } }` |
| AC7: UI feedback** | Success toast "Bid submitted!"; redirect to bid (or stay on job with bid shown in list) |

**API:**
```
POST /api/bids
body: { job_id, proposal_text, bid_amount, bid_timeline }
auth: FREELANCER
response: 201 { bid }
error: 400 (validation), 403 (quota exceeded), 409 (duplicate)
```

**Quota notes** (source: `PLAN_ENTITLEMENTS` in `packages/config/src/plans.ts`):
- FREE: 5 active bids, 2 active accepted contracts
- PRO: 30 / 10
- AGENCY: 200 / 75
- Active bid statuses: SUBMITTED, SHORTLISTED, ACCEPTED
- Active contract statuses: ACTIVE, IN_PROGRESS

---

### Story 4.2: Client Accepts Bid (Creates Contract)

**Title:** Client selects freelancer and accepts bid

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Accept button** | On bid detail (or bid list item); POST /api/bids/:bidId/accept |
| AC2: Contract creation** | Create Contract record: status = PENDING; link to Bid (no payment yet) |
| AC3: Job closure** | Job may remain OPEN until payment; other bids stay open until client pays (or rejects) |
| AC4: No escrow yet** | No PaymentIntent until client starts checkout; payment_status / escrow_status = NONE |
| AC5: Notifications** | Notify freelancer: "Your bid was accepted! Client will pay within 3 days."; notify client: "Bid accepted. Proceed to payment." |
| AC6: Payment page** | Redirect client to payment flow (Stripe/Midtrans) — contract must be PENDING |
| AC7: Contract ID** | Generate & show to both parties; use for messaging, escrow, payout |

**API:**
```
POST /api/bids/:bidId/accept
auth: CLIENT (job owner)
response: 201 { contract: { id, status: "PENDING" } }
error: 403 (not job owner), 409 (bid already accepted/rejected), 404 (bid not found)
```

**Side effects:**
1. Bid.status = ACCEPTED
2. Contract created with status = PENDING
3. Notification queue: freelancer + client
4. Client initiates payment separately (Story 5.1)

---

## 5. Payment & Escrow

### Story 5.1: Client Initiates Payment (v2.1)

**Title:** Client authorizes payment for contract (Stripe/Midtrans)

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Payment initiation** | Client navigates to payment page after accepting bid; sees contract amount (IDR), payment methods (Stripe, Midtrans) |
| AC2: Stripe flow** | Click "Pay with card" → Stripe PaymentIntent created; frontend: Stripe.js confirmPayment(); shows card form |
| AC3: Midtrans flow** | Click "Pay with Midtrans" → Snap token generated; window.snap.pay(snapToken); mobile-friendly payment selector (card, bank transfer, e-wallet) |
| AC4: Payment status UI** | Show "Processing..." during payment; spinner |
| AC5: Success redirect** | After successful payment → "Payment confirmed! Contract active." + redirect to contract detail |
| AC6: Failure handling** | If payment fails → "Payment declined. Try again." + button to retry; don't charge again on retry |
| AC7: Payment record** | Create PaymentIntent: provider STRIPE | MIDTRANS, status PENDING → SUCCEEDED on webhook; PaymentTransaction CHARGE on capture |
| AC8: Escrow hold** | On webhook success: Contract.status = IN_PROGRESS, escrowStatus = LOCKED, EscrowTransaction LOCK |

**API (Frontend view):**
```
POST /api/payments/stripe/create-intent
body: { contractId }
auth: CLIENT
response: 200 { client_secret, payment_intent_id, amount, currency }

POST /api/payments/midtrans/create-snap
body: { contractId }
auth: CLIENT
response: 200 { snap_token, order_id, … }
```

**v2.1 Critical:**
- Webhook verification MUST pass before payment is marked CAPTURED
- Payment record created immediately; webhook updates status

---

### Story 5.2: Webhook Verification & Payment Capture (v2.1 CRITICAL)

**Title:** PSP webhook arrives; verify & update payment status

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Stripe webhook** | POST /api/payments/stripe/webhook with Stripe-Signature header; verify HMAC t.v1 |
| AC2: Stripe HMAC verify** | If signature invalid → log error, return 400 (Stripe retry); if valid → process event |
| AC3: Midtrans webhook** | POST /api/payments/midtrans/notification; verify SHA512(order_id + status_code + gross_amount + serverKey) |
| AC4: Idempotency** | Insert WebhookEvent (provider, externalId); duplicate → return 200, skip processing |
| AC5: Event routing** | Stripe: payment_intent.succeeded, payment_intent.payment_failed; Midtrans: settlement/capture status codes |
| AC6: Payment update** | PaymentIntent → SUCCEEDED; PaymentTransaction CHARGE with providerTxnId |
| AC7: Contract update** | Contract → IN_PROGRESS, paymentStatus CONFIRMED, escrowStatus LOCKED |
| AC8: Logging** | Log all webhook events (with timestamp, psp, transaction_id, status); no sensitive data (no card numbers) |
| AC9: Error response** | If unexpected error → log + return 500, allow Stripe/Midtrans to retry |
| AC10: Test harness** | Staging: ability to simulate webhook (manual trigger for testing, not in production) |

**API (Backend):**
```
POST /api/payments/stripe/webhook
header: Stripe-Signature
body: raw Stripe event JSON
response: 200 { received: true }

POST /api/payments/midtrans/notification
body: Midtrans notification JSON (signature_key)
response: 200 { status: 'ok' }
```

**Testing:**
- Unit test: HMAC verify (use Stripe test vectors)
- E2E test: Stripe test mode → mock webhook → verify Payment updated
- Staging test harness: admin endpoint `/api/admin/webhooks/simulate` (not prod)

**Database:**
```sql
-- WebhookEvent (idempotency) — see schema.prisma
CREATE UNIQUE INDEX ON "WebhookEvent" ("provider", "externalId");
```

---

### Story 5.3: Escrow Hold & Release (v2.1)

**Title:** Escrow payment lifecycle (hold → release on completion)

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Review window** | After payment locked: freelancer submits work → IN_REVIEW; `workReviewDays` = 5 (`V2_PRICING`) |
| AC2: Freelancer completion** | POST /api/escrow/:contractId (submit work) → status IN_REVIEW |
| AC3: Client approval** | PATCH /api/escrow/:contractId action=approve → 80% partial release to wallet |
| AC4: Holdback** | 20% held for `chargebackHoldDays` = 7; then worker releases remainder |
| AC5: Auto-release** | If client silent past 5d review deadline → auto 80% release (same as approve) |
| AC6: Payout queue** | Released amounts accumulate in FreelancerWallet; daily payout batch (MOCK) |
| AC7: Notification** | Notify freelancer on partial/full release |
| AC8: Status tracking** | GET /api/escrow/:contractId shows escrowStatus, workReviewDeadline, transactions[] |

**API:**
```
PATCH /api/contracts/:contractId
body: { status: COMPLETED, approved?: true }
auth: CLIENT or FREELANCER
response: 200 { contract }
```

**Worker task** (`apps/worker/src/v2Jobs.ts` — `processEscrowAutoReleases`):
```javascript
// IN_REVIEW + workReviewDeadline passed → releasePartialEscrow (80%)
// PARTIAL_RELEASED + holdback period passed → release remaining 20%
```

---

## 6. Trust & Safety

### Story 6.1: Report Job/User

**Title:** User reports suspicious job or freelancer

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Report form** | Modal/page with reason dropdown (scam, low pay, harassment, copyrighted content, other), optional description (max 500 chars) |
| AC2: Validation** | Reason required; description optional |
| AC3: Report save** | Create Report record: status = OPEN, created_at, reporter_id, target_id, reason |
| AC4: Notification** | In-app: "Thanks for reporting. We'll review this shortly." |
| AC5: Admin alert** | Report appears in /admin/reports queue; SLA timer starts (24h default) |
| AC6: Deduplication** | If same target reported 3+ times in 24h → auto-escalate to admin |
| AC7: Reporter privacy** | Report not visible to target (except admin) |

**API:**
```
POST /api/reports
body: { target_id, target_type: JOB | USER, reason, description? }
auth: any user
response: 201 { report }
```

---

### Story 6.2: Admin Moderation Queue

**Title:** Admin reviews reports and takes action

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Queue view** | /admin/reports shows all OPEN reports; sorted by created_at (oldest first); SLA status indicator (green <12h, yellow <18h, red >18h) |
| AC2: Report detail** | Show: reporter, target (job/user), reason, description, target preview (job title or user name + history), previous reports on target |
| AC3: Actions** | Admin can: DISMISS (close, no action), HIDE (remove job from board), SUSPEND (disable user account for 30 days), REQUEST_INFO (email target asking for clarification, v2.2) |
| AC4: Notes** | Admin can add internal notes (visible to staff only); resolution_note field |
| AC5: Status update** | Report.status = RESOLVED when action taken; resolved_at timestamp |
| AC6: Escalation** | Admin can mark as ESCALATED (for legal/security review) |
| AC7: Audit log** | All admin actions logged: report_id, admin_id, action, timestamp, notes |

**API:**
```
GET /api/admin/reports?status=OPEN&sort=created_at&limit=50&page=1
auth: STAFF
response: 200 { reports[] }

PATCH /api/admin/reports/:reportId
body: { status: DISMISSED | RESOLVED | ESCALATED, action: HIDE | SUSPEND?, resolution_note?, internal_notes? }
auth: STAFF
response: 200 { report }
```

---

## 7. Reviews & Ratings

### Story 7.1: Post Contract Review

**Title:** After contract completion, rate counterparty

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Review eligibility** | Only after Contract.status = COMPLETED; review window 7 days (after 7 days, can't rate) |
| AC2: Review form** | Score (1–5 stars), text (max 500 chars), optional tags (e.g., "Fast", "Communicative", "Professional") |
| AC3: Save review** | Create Review record: contract_id, rater_id, ratee_id, score, text, created_at |
| AC4: Profile update** | Update User profile: avg_rating (avg of all Review.score), total_ratings (count) |
| AC5: Visibility** | Reviews visible on /users/:userId/reviews; paginated; sorted by most_recent |
| AC6: Response review** | (Future v2.2) Ratee can respond to review; threaded view |
| AC7: Notification** | Notify ratee: "[Name] left you a [score]-star review" |

**API:**
```
POST /api/contracts/:contractId/reviews
body: { score: 1–5, text?, tags? }
auth: CONTRACT_PARTY (client or freelancer, not rater_id = ratee_id)
response: 201 { review }

GET /api/users/:userId/reviews?limit=10&page=1
response: 200 { reviews[], avg_score, total_ratings }
```

---

## 8. Messaging

### Story 8.1: Send Message (Job-bound)

**Title:** Client & freelancer message within contract

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Message form** | Text input (required, max 5000 chars), file attachment (optional, max 10MB) |
| AC2: Validation** | Text required; if empty → disable send button |
| AC3: Message save** | Create Message: contract_id, sender_id, text, attachments, created_at |
| AC4: Read status** | read_at = null initially; update when counterparty opens thread |
| AC5: Notification** | In-app notification to recipient; email (if subscribed, v2.2) |
| AC6: Message list** | Show all messages in contract (reverse chronological; newest at bottom; auto-scroll) |
| AC7: File preview** | Image/PDF attachments show preview; non-images show file name + download link |
| AC8: Performance** | Messages loaded in pages (lazy load if >50 messages) |
| AC9: Typing indicator** | (Future, WebSocket v2.2) Show "Name is typing..." |

**API:**
```
GET /api/contracts/:contractId/messages?limit=50&page=1
auth: CONTRACT_PARTY
response: 200 { messages[] }

POST /api/contracts/:contractId/messages
body: { text, attachments? }
auth: CONTRACT_PARTY
response: 201 { message }
```

**Storage (attachments):**
- Upload to cloud storage (S3 or DigitalOcean Spaces)
- Return URL (HTTPS)
- Virus scan optional (Clamav, v3.0)

---

## 9. Subscriptions & Monetization

### Story 9.1: Upgrade Subscription

**Title:** User upgrades from FREE to PRO/AGENCY

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Pricing page** | /pricing shows plans aligned with `PLAN_ENTITLEMENTS`; paid checkout via SubscriptionPlan catalog (admin) |
| AC2: Feature comparison** | Quotas: FREE 5 bids / 2 contracts; PRO 30/10; AGENCY 200/75 |
| AC3: Upgrade button** | "Upgrade to PRO" → payment flow (Stripe/Midtrans) |
| AC4: Subscription creation** | After successful payment → Subscription record: plan, starts_at, expires_at (30 days), auto_renew = true |
| AC5: Quota enforcement** | System checks User.subscription.plan before allowing job post; if FREE + 5 jobs open → error "Upgrade to PRO for unlimited jobs" |
| AC6: Auto-renewal** | 3 days before expires_at → charge again (auto-renew if enabled) |
| AC7: Cancellation** | User can cancel subscription (before next billing cycle); expires_at reached → plan reverts to FREE |
| AC8: Receipt** | Email receipt after successful payment with transaction ID, amount, plan, renewal date |

**API:**
```
POST /api/subscriptions/upgrade
body: { plan: PRO | AGENCY, payment_method: CARD | BANK_TRANSFER }
auth: any user
response: 201 { subscription }

GET /api/subscriptions/current
auth: any user
response: 200 { subscription } or null

DELETE /api/subscriptions/current
auth: any user
response: 200 { message: "Subscription cancelled" }
```

---

## 10. Recommendations

### Story 10.1: Batch Recommendations (Job Suggestions)

**Title:** System recommends jobs to freelancers daily

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1: Batch job** | Worker runs daily at 00:00 UTC+7 (cron: `0 0 * * *` in Asia/Jakarta tz) |
| AC2: Matching logic** | For each freelancer: find open jobs with category match + budget overlap + work_mode match; rank by relevance |
| AC3: Filtering** | Exclude jobs already bid on; exclude if >30 bids already (to avoid long tail) |
| AC4: Storage** | Create Recommendation records: freelancer_id, job_id, score (0–100), created_at |
| AC5: UI display** | Freelancer dashboard shows "Recommended for you" section; top 5 jobs; shuffled daily |
| AC6: Performance** | Batch completes in <5 min for 10k freelancers |
| AC7: Limits** | Show top 5 free, 10 with PRO subscription (future v2.2: show 20 PLUS version) |

**API:**
```
GET /api/recommendations?limit=5
auth: FREELANCER
response: 200 { recommendations: [ { job, score }, ... ] }
```

**Worker logic (pseudo):**
```javascript
async function generateRecommendations() {
  const freelancers = await User.find({ role: FREELANCER });

  for (const freelancer of freelancers) {
    const profile = await Profile.findOne({ userId: freelancer.id });
    const skills = profile.skills; // [ "design", "web" ]

    const matchingJobs = await Job.find({
      status: OPEN,
      category: { $in: skills },
      $expr: { $and: [
        { $lte: ['$budget_min', freelancer.budget_preference] },
        { $gte: ['$budget_max', freelancer.min_acceptable_rate] }
      ]}
    }).limit(50);

    const scored = matchingJobs.map(job => ({
      job_id: job.id,
      freelancer_id: freelancer.id,
      score: calcScore(job, profile), // category match + budget + recency
      created_at: new Date()
    }));

    await Recommendation.insertMany(scored);
  }
}
```

---

## 11. Acceptance Criteria Template (for all stories)

Each story must satisfy:

```markdown
### Story [ID]: [Title]

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| AC1 | ... |
| AC2 | ... |
| AC[N] | ... |

**API/Endpoint:**
```
METHOD /api/path
auth: [role]
body: { ... }
response: [status] { ... }
```

**Unit tests:**
- [ ] Input validation
- [ ] Error handling
- [ ] Happy path

**E2E tests:**
- [ ] Full workflow (e.g., job post → bid → payment → release)

**Ops notes:**
- [ ] New env var? Migrations? Deployment dependencies?

**Security notes:**
- [ ] No secrets in response
- [ ] RBAC enforced
- [ ] Rate limits applied
```

---

## 12. Non-Functional Requirements

| Category | Requirement | Metric |
|----------|-------------|--------|
| **Performance** | API response time | p95 <500ms |
| **Performance** | Job search latency | <1s (Redis cached) |
| **Availability** | Uptime | 99.5% (45 min downtime/month) |
| **Scalability** | Concurrent users | 1000 (v1), 10k (v2.2) |
| **Security** | Data encryption** | TLS 1.2+; DB at-rest encryption |
| **Security** | Auth** | JWT 7-day expiry (SameSite=Lax cookie); CSRF on all mutations |
| **Compliance** | GDPR** | Data export, deletion (v3.0) |
| **Compliance** | Indonesia tax** | Support for PPh 21 reporting (v2.2) |

---

## 13. Known Limitations & Future Work

### MVP limitations

- No mobile app (web-only; mobile web responsive)
- Messaging polling (not WebSocket; delays 5–10s)
- Payment MOCK (v2.1 will fix)
- Admin panel stub (basic only)
- No video interviews
- No AI real-time matching

### Future (v2.2+)

- WebSocket messaging (realtime)
- Mobile app (iOS/Android, Expo)
- Agency multi-seat UX
- Hourly work tracking (time diary, desktop app)
- Subscriptions (recurring contracts)
- Commission collection (5–8% on successful projects)

---

## 14. Document Control

| Version | Date | Author | Change |
|---------|------|--------|--------|
| v1.0 | Jul 26 2026 | Dozer | Initial: core stories (auth, jobs, bids, payment, trust, reviews, messaging, subs, recommendations) |
| v1.1 | Jul 26 2026 | Dozer | Code-as-truth: accept-bid PENDING flow, plans.ts quotas, payment webhook paths, escrow 5d/80-20 |

---

**Cross-references:**
- PRD v3.0: business model, value props, monetization
- SDD v1.0: technical architecture, API design, data model
- FEATURE-CATALOG: feature status (Available, Conditional, Roadmap)
- CHANGELOG: version history
