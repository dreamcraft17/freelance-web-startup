# NearWork V2 — Software Requirements Specification (SRS)

**Document Version:** 1.0  
**Last Updated:** 2026-07-07  
**Author:** Dozer (Lead Engineer)  
**Status:** Implementation  
**Target Release:** Q3/Q4 2026

---

## 1. Introduction & Scope

### 1.1 Purpose
This SRS details **technical requirements** for NearWork V2, covering:
- Functional requirements (payment, billing, escrow, AI matching, moderation)
- Non-functional requirements (security, performance, scalability)
- API specifications (endpoints, request/response schemas)
- Database schema changes
- System integration points (Stripe, Midtrans, OpenAI)

### 1.2 Audience
- **Backend developers** — API & service implementation
- **Frontend developers** — UI integration with payment/billing flows
- **QA engineers** — test case derivation
- **DevOps/SRE** — infrastructure, monitoring, alerting

### 1.3 Constraints
- **Language:** TypeScript (existing codebase)
- **Framework:** Next.js 15, NestJS (worker)
- **Database:** PostgreSQL 14+, Prisma ORM
- **Deployment:** Vercel (web), custom container (worker)
- **Budget:** Assume 2-3 engineers, 4-5 month timeline
- **PCI Compliance:** Payment processing delegated to Stripe/Midtrans (no card storage on platform)

---

## 2. Functional Requirements

### 2.1 Payment & Billing System

#### 2.1.1 Stripe Integration
**Requirement:** Platform must accept credit/debit card payments via Stripe.

| ID | Requirement | Type | Priority |
|----|----|------|----------|
| FR-201 | Initialize Stripe SDK on client side | Functional | P0 |
| FR-202 | Create PaymentIntent server-side (idempotent) | Functional | P0 |
| FR-203 | Handle Stripe webhook: payment_intent.succeeded | Functional | P0 |
| FR-204 | Handle Stripe webhook: payment_intent.payment_failed | Functional | P0 |
| FR-205 | Handle Stripe webhook: charge.dispute.created (chargeback) | Functional | P1 |
| FR-206 | Retry failed payment 3x with exponential backoff | Functional | P1 |
| FR-207 | Store Stripe payment_intent_id in DB for audit | Functional | P1 |

**Implementation Details:**

```
Endpoint: POST /api/payments/stripe/create-intent
Request {
  amount: number (cents, e.g., 5000 = $50.00)
  currency: "usd" | "idr"
  contractId: UUID
  metadata: { clientId, freelancerId, jobId }
}
Response {
  client_secret: string
  payment_intent_id: string
  status: "requires_payment_method" | "succeeded" | "processing"
}
```

```
Endpoint: POST /api/payments/stripe/webhook
Body: Stripe event JSON (signature verified via X-Stripe-Signature header)
Logic:
  1. Verify header signature using stripe.webhooks.constructEvent()
  2. Extract event.type, event.data.object
  3. If payment_intent.succeeded:
     - Find contract by intent_id
     - Update contract.escrow_balance, contract.status → PAYMENT_CONFIRMED
     - Create PaymentTransaction record for audit
     - Send email receipt (async job to worker)
  4. If payment_intent.payment_failed:
     - Update contract.status → PAYMENT_FAILED
     - Notify client (retry needed)
  5. All requests return 200 immediately (async processing)
```

**Database Schema:**
```prisma
model PaymentIntent {
  id               String @id @default(cuid())
  contractId       String @unique
  contract         Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
  
  stripeIntentId   String @unique
  amount           Int       // cents
  currency         String
  status           String    // requires_payment_method, processing, succeeded, requires_action
  
  metadata         Json?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model PaymentTransaction {
  id               String @id @default(cuid())
  contractId       String
  contract         Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
  
  type             String    // CHARGE, REFUND, PAYOUT
  amount           Int
  currency         String
  fee              Int       // platform fee or processor fee
  status           String    // pending, succeeded, failed
  
  provider         String    // stripe, midtrans
  providerTxnId    String
  
  metadata         Json?
  
  createdAt        DateTime @default(now())
}
```

#### 2.1.2 Midtrans Integration
**Requirement:** Support Midtrans for local payment methods (VA, e-wallet).

| ID | Requirement | Type | Priority |
|----|---------|------|---------|
| FR-211 | Create Snap token via Midtrans API | Functional | P0 |
| FR-212 | Embed Snap iframe in checkout page | Functional | P0 |
| FR-213 | Handle Midtrans HTTP notification (callback) | Functional | P0 |
| FR-214 | Validate callback signature (SHA512) | Functional | P0 |
| FR-215 | Support VA, GCash, QRIS methods | Functional | P0 |
| FR-216 | Expiry handling: auto-cancel if unpaid 24h | Functional | P1 |

**Implementation Details:**

```
Endpoint: POST /api/payments/midtrans/create-snap
Request {
  amount: number (IDR)
  contractId: UUID
  clientEmail: string
  clientName: string
}
Response {
  snap_token: string
  snap_redirect_url: string
  order_id: string
}
```

```
Endpoint: POST /api/payments/midtrans/notification
Body: {
  transaction_id,
  order_id,
  gross_amount,
  payment_type,
  transaction_status,
  signature_key
}
Logic:
  1. Verify signature: SHA512(order_id + status + gross_amount + MIDTRANS_SERVER_KEY)
  2. If status = settlement:
     - Update contract.escrow_balance, status → PAYMENT_CONFIRMED
     - Create PaymentTransaction record
     - Send receipt email (async)
  3. If status = expire:
     - Update contract.status → PAYMENT_EXPIRED
     - Auto-cancel contract, re-open job
  4. If status = deny:
     - Update contract.status → PAYMENT_FAILED
```

**Database Integration:**
- Reuse `PaymentIntent` + `PaymentTransaction` tables
- Add column: `PaymentIntent.midtransOrderId`

#### 2.1.3 Invoice Generation & Email
**Requirement:** Auto-generate PDF invoice after successful payment.

| ID | Requirement | Type | Priority |
|----|---------|------|---------|
| FR-221 | Generate PDF invoice with Puppeteer/wkhtmltopdf | Functional | P0 |
| FR-222 | Include: invoice#, date, client/freelancer, job title, amount, fee, tax | Functional | P0 |
| FR-223 | Include QR code linking to contract detail | Functional | P1 |
| FR-224 | Email invoice as attachment (async job) | Functional | P0 |
| FR-225 | Store invoice file in DigitalOcean Spaces (audit trail) | Functional | P1 |

**Implementation:**

```typescript
// Service: PaymentService.generateInvoice()
async generateInvoice(contractId: string) {
  const contract = await prisma.contract.findUnique({
    include: { client: true, freelancer: true, job: true }
  });
  
  // Render HTML template with contract data
  const html = await renderTemplate('invoice', {
    invoiceNumber: `INV-${contract.id.slice(0, 8)}`,
    date: new Date(),
    client: contract.client,
    freelancer: contract.freelancer,
    amount: contract.amount,
    fee: contract.amount * 0.02,
    tax: contract.amount * 0.10, // PPN 10%
    qrCode: QRCode.toDataURL(`/contract/${contract.id}`)
  });
  
  // Generate PDF
  const pdf = await puppeteer.generatePDF(html);
  
  // Upload to Spaces
  const key = `invoices/${contract.id}.pdf`;
  await spacesClient.putObject({ 
    Bucket: 'nearwork', Key: key, Body: pdf 
  });
  
  // Send email (background job)
  await publishEvent('invoice.generated', {
    contractId, invoiceUrl: `https://spaces.cdn.nearwork/${key}`
  });
}
```

---

### 2.2 Subscription & Quota Management

#### 2.2.1 Subscription Models
**Requirement:** Support FREE / PRO / AGENCY subscription tiers.

| ID | Requirement | Type | Priority |
|----|---------|------|---------|
| FR-301 | Retrieve user current subscription | Functional | P0 |
| FR-302 | Initialize subscription purchase (Stripe/Midtrans) | Functional | P0 |
| FR-303 | Recurring billing every 30 days (auto-charge) | Functional | P0 |
| FR-304 | Handle subscription renewal failure (retry 3x) | Functional | P1 |
| FR-305 | Cancel subscription (effective next billing period) | Functional | P1 |
| FR-306 | Downgrade tier (effective next period, safe) | Functional | P1 |
| FR-307 | Proration: charge difference on upgrade (mid-cycle) | Functional | P1 |
| FR-308 | List subscription history & charges | Functional | P1 |

**Database Schema:**
```prisma
model SubscriptionPlan {
  id               String @id @default(cuid())
  name             String @unique // FREE, PRO, AGENCY
  displayName      String
  monthlyPrice     Int    // cents (0 for FREE)
  currency         String // usd, idr
  
  config           Json   // { activeBids: 5, activeContracts: 2, ... }
  features         String[] // JSON array of feature flags
  
  createdAt        DateTime @default(now())
}

model UserSubscription {
  id               String @id @default(cuid())
  userId           String
  user             User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  planId           String
  plan             SubscriptionPlan @relation(fields: [planId], references: [id])
  
  stripeSubId      String? // Stripe subscription ID
  midtransSubId    String? // Midtrans subscription ID
  
  status           String    // active, past_due, canceled, paused
  currentPeriodStart DateTime
  currentPeriodEnd DateTime
  
  autoRenew        Boolean @default(true)
  canceledAt       DateTime?
  cancelReason     String?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@unique([userId, status]) // Only 1 active per user
}

model SubscriptionCharge {
  id               String @id @default(cuid())
  subscriptionId   String
  subscription     UserSubscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  
  amount           Int
  status           String    // pending, succeeded, failed, refunded
  billingPeriod    String    // 2026-08-01 to 2026-08-31
  
  stripeInvoiceId  String?
  midtransInvoiceId String?
  
  attemptCount     Int @default(0)
  nextRetryAt      DateTime?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

#### 2.2.2 Quota Enforcement
**Requirement:** Enforce active bids/contracts limits at submission time.

| ID | Requirement | Type | Priority |
|----|---------|------|---------|
| FR-311 | Check active bid count before submission | Functional | P0 |
| FR-312 | Reject bid if user exceeds quota | Functional | P0 |
| FR-313 | Show quota usage in freelancer dashboard | Functional | P0 |
| FR-314 | Graceful upgrade UX: "Upgrade to PRO for more bids" | Functional | P1 |
| FR-315 | Grace period 3 days post-cancellation | Functional | P1 |

**Implementation:**

```typescript
// Policy: BidPolicy.canSubmitBid()
async canSubmitBid(userId: string): Promise<boolean> {
  const user = await getUser(userId);
  const subscription = await getActiveSubscription(userId);
  const plan = subscription.plan;
  const config = JSON.parse(plan.config);
  
  const activeBidCount = await prisma.bid.count({
    where: {
      freelancerId: userId,
      status: 'ACTIVE',
      // Exclude bids older than cancellation + grace period
      createdAt: {
        gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    }
  });
  
  return activeBidCount < config.activeBids;
}
```

---

### 2.3 Boost & Featured Listings

#### 2.3.1 Boost Purchase Flow
**Requirement:** Users can purchase boost for job/profile visibility.

| ID | Requirement | Type | Priority |
|----|---------|------|---------|
| FR-401 | List available boost products | Functional | P0 |
| FR-402 | Initialize boost purchase (one-time payment) | Functional | P0 |
| FR-403 | Activate boost immediately post-payment | Functional | P0 |
| FR-404 | Show boost badge on job/profile | Functional | P0 |
| FR-405 | Auto-deactivate boost when expired | Functional | P0 |
| FR-406 | Allow boost renewal before expiry (chain) | Functional | P1 |
| FR-407 | Log boost analytics (impressions, clicks, bids) | Functional | P2 |

**Database Schema:**
```prisma
model BoostProduct {
  id               String @id @default(cuid())
  name             String    // "Job Boost 7 days", "Profile Badge 30 days"
  type             String    // JOB_BOOST, PROFILE_FEATURE, TOP_FREELANCER_BADGE
  durationDays     Int
  price            Int       // cents
  
  config           Json      // { impressionMultiplier: 1.5, ... }
  createdAt        DateTime @default(now())
}

model Boost {
  id               String @id @default(cuid())
  userId           String
  user             User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  productId        String
  product          BoostProduct @relation(fields: [productId], references: [id])
  
  targetType       String    // JOB, PROFILE
  targetId         String    // jobId or freelancerId (same as userId for profile)
  
  status           String    // ACTIVE, EXPIRED, PAUSED
  expiresAt        DateTime
  
  paymentTxnId     String?
  
  createdAt        DateTime @default(now())
  expiredAt        DateTime?
}
```

#### 2.3.2 Search Ranking with Boosts
**Requirement:** Boosted items rank higher in search results.

| ID | Requirement | Type | Priority |
|----|---------|------|---------|
| FR-411 | Include boost status in search query | Functional | P0 |
| FR-412 | Rank boosted jobs at top (expiresAt DESC) | Functional | P0 |
| FR-413 | Rank boosted freelancers in `/freelancers` directory | Functional | P0 |
| FR-414 | Add "Featured" badge on UI | Functional | P0 |

**Search Query Enhancement:**
```sql
-- Original query
SELECT * FROM jobs WHERE status = 'OPEN' ORDER BY created_at DESC

-- Enhanced with boost
SELECT j.*, 
       CASE WHEN b.id IS NOT NULL THEN 1 ELSE 0 END as is_boosted,
       b.expires_at as boost_expires_at
FROM jobs j
LEFT JOIN boosts b ON j.id = b.target_id AND b.target_type = 'JOB'
WHERE j.status = 'OPEN' AND (b.expires_at IS NULL OR b.expires_at > NOW())
ORDER BY is_boosted DESC, b.expires_at DESC, j.created_at DESC
```

---

### 2.4 Escrow & Payment Protection

#### 2.4.1 Escrow Lifecycle
**Requirement:** Funds held in platform account until work delivery confirmed.

| ID | Requirement | Type | Priority |
|----|---------|------|---------|
| FR-501 | Lock escrow immediately post-payment | Functional | P0 |
| FR-502 | Transition contract to IN_PROGRESS after payment | Functional | P0 |
| FR-503 | Freelancer can submit work (upload + message) | Functional | P0 |
| FR-504 | Client review work within 5 days | Functional | P0 |
| FR-505 | Auto-release 80% after 5-day review window if no action | Functional | P1 |
| FR-506 | Release holdback 20% after 7 days (chargeback window) | Functional | P1 |
| FR-507 | Log all escrow state changes in audit | Functional | P1 |

**Contract State Machine:**
```
OPEN → BID_ACCEPTED 
     → PAYMENT_PENDING → PAYMENT_CONFIRMED (escrow locked)
     → IN_PROGRESS (freelancer works)
     → IN_REVIEW (freelancer submitted work)
     → COMPLETED (client approved)
     → RELEASED (funds released to freelancer)
     
     → DISPUTE (if customer initiated refund request)
     → ARBITRATING (admin reviewing)
     → RESOLVED (admin decision: refund or release)
```

**Database Schema:**
```prisma
model Contract {
  // ... existing fields ...
  
  escrowStatus     String    // LOCKED, PARTIAL_RELEASED, FULLY_RELEASED, DISPUTED
  escrowAmount     Int       // cents
  escrowReleasedAt DateTime?
  
  paymentStatus    String    // PENDING, CONFIRMED, FAILED
  paymentIntentId  String?
  
  workSubmittedAt  DateTime?
  workReviewDeadline DateTime?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  escrowTransactions EscrowTransaction[]
  disputes         ContractDispute[]
}

model EscrowTransaction {
  id               String @id @default(cuid())
  contractId       String
  contract         Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
  
  type             String    // LOCK, PARTIAL_RELEASE, FULL_RELEASE, REFUND
  amount           Int
  reason           String?
  
  createdBy        String?   // userId or "system"
  
  createdAt        DateTime @default(now())
}

model ContractDispute {
  id               String @id @default(cuid())
  contractId       String @unique
  contract         Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
  
  initiatedBy      String    // clientId or freelancerId
  reason           String
  evidence         String[]  // array of file URLs (uploaded to Spaces)
  
  assignedTo       String?   // moderatorId
  admin            User? @relation(fields: [assignedTo], references: [id])
  
  status           String    // OPEN, REVIEWING, RESOLVED, APPEALED
  decision         String?   // FAVOR_CLIENT, FAVOR_FREELANCER, SPLIT
  resolution       String?   // detailed explanation
  
  resolutionAt     DateTime?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

#### 2.4.2 Payout Processing
**Requirement:** Weekly batch payout to freelancer bank accounts.

| ID | Requirement | Type | Priority |
|----|---------|------|---------|
| FR-511 | Freelancer add bank account (verification via micro-deposit) | Functional | P1 |
| FR-512 | Request payout with minimum threshold (Rp 100k) | Functional | P0 |
| FR-513 | Batch payout every Monday midnight (cron job) | Functional | P0 |
| FR-514 | Retry failed payouts 3x before manual review | Functional | P1 |
| FR-515 | Email notification: payout sent + bank confirmation | Functional | P0 |
| FR-516 | Track payout status in user wallet page | Functional | P0 |

**Implementation:**

```typescript
// Worker job: PayoutWorker.processBatchPayout()
async processBatchPayout() {
  const pendingPayouts = await prisma.payoutRequest.findMany({
    where: { status: 'PENDING', requestedAt: { lte: DateTime.now() } },
    include: { freelancer: { include: { bankAccount: true } } }
  });
  
  for (const payout of pendingPayouts) {
    try {
      // Call bank API (Wise, local bank, etc.)
      const receipt = await bankAPI.transfer({
        accountNumber: payout.freelancer.bankAccount.accountNumber,
        amount: payout.amount,
        description: `NearWork payout for completed contracts`
      });
      
      // Update status
      await prisma.payoutRequest.update({
        where: { id: payout.id },
        data: { status: 'SENT', receiptId: receipt.id, sentAt: new Date() }
      });
      
      // Email notification
      await publishEvent('payout.sent', { payoutId: payout.id });
      
    } catch (error) {
      // Retry logic with exponential backoff
      const nextRetry = addDays(new Date(), Math.pow(2, payout.retryCount));
      await prisma.payoutRequest.update({
        where: { id: payout.id },
        data: { 
          retryCount: payout.retryCount + 1,
          nextRetryAt: nextRetry,
          lastError: error.message
        }
      });
    }
  }
}
```

---

### 2.5 AI Matching Engine (MVP)

#### 2.5.1 Recommendation Algorithm
**Requirement:** Daily batch compute job recommendations for each freelancer.

| ID | Requirement | Type | Priority |
|----|---------|------|---------|
| FR-601 | Extract freelancer skills, portfolio, reviews | Functional | P0 |
| FR-602 | Compute Jaccard similarity (skill overlap) | Functional | P0 |
| FR-603 | Compute category match score | Functional | P0 |
| FR-604 | Compute location proximity score (hyperlocal) | Functional | P1 |
| FR-605 | Aggregate scores into single relevance score (0-100) | Functional | P0 |
| FR-606 | Filter expired / on-site jobs outside service radius | Functional | P0 |
| FR-607 | Deduplicate: don't recommend already-bid jobs | Functional | P0 |

**Algorithm (Pseudocode):**
```
For each freelancer F:
  skills = extract(F.profile.skills)
  portfolio_categories = extract(F.portfolio[*].category)
  location = F.profile.location
  
  For each open job J:
    if J is already bid by F: skip
    if J is expired: skip
    
    skill_score = jaccard_similarity(skills, J.skills) * 40
    category_score = (1 if category(F) == category(J) else 0.5) * 30
    location_score = compute_location_distance(F.location, J.location) * 20
    experience_score = (F.avg_rating / 5) * 10
    
    relevance = skill_score + category_score + location_score + experience_score
    
    if relevance > 50:
      CREATE recommendation(F.id, J.id, relevance, reasons=[...])
```

**Database Schema:**
```prisma
model Recommendation {
  id               String @id @default(cuid())
  freelancerId     String
  freelancer       User @relation(fields: [freelancerId], references: [id], onDelete: Cascade)
  
  jobId            String
  job              Job @relation(fields: [jobId], references: [id], onDelete: Cascade)
  
  score            Int    // 0-100
  matchReasons     String[] // ["3 skill match", "same city", "budget match"]
  
  viewedAt         DateTime?
  clickedAt        DateTime?
  bidSentAt        DateTime?
  
  createdAt        DateTime @default(now())
  expiresAt        DateTime // 30 days from creation
  
  @@unique([freelancerId, jobId])
}

model RecommendationMetric {
  id               String @id @default(cuid())
  date             DateTime @unique
  
  totalGenerated   Int
  totalViewed      Int
  totalClicked     Int
  totalBids        Int
  ctrRate          Float // clicked / viewed
  
  createdAt        DateTime @default(now())
}
```

#### 2.5.2 Recommendation Delivery
**Requirement:** Push recommendations via email digest + dashboard.

| ID | Requirement | Type | Priority |
|----|---------|------|---------|
| FR-611 | Email digest 1x daily (9am user timezone) | Functional | P0 |
| FR-612 | Include top 5 jobs + match score + match reasons | Functional | P0 |
| FR-613 | Add unsubscribe link | Functional | P0 |
| FR-614 | Dashboard widget shows top 5 recommendations | Functional | P0 |
| FR-615 | Track metrics: open rate, click rate, bid rate | Functional | P1 |

---

### 2.6 Advanced Moderation & Appeals

#### 2.6.1 Moderation Report System
**Requirement:** Handle user-submitted reports (fraud, harassment, ToS violation).

| ID | Requirement | Type | Priority |
|----|---------|------|---------|
| FR-701 | Accept moderation reports from any user | Functional | P0 |
| FR-702 | Classify report: fraud, harassment, low-quality, hate-speech, other | Functional | P0 |
| FR-703 | Auto-deduplicate similar reports (same user, same reported item) | Functional | P1 |
| FR-704 | Assign SLA based on category (fraud=24h, harassment=48h) | Functional | P0 |
| FR-705 | Assign to moderator (round-robin or load-balanced) | Functional | P0 |
| FR-706 | Moderator can add notes, request evidence, interview parties | Functional | P0 |
| FR-707 | Resolve: Warning / Soft Suspend / Hard Suspend + reason | Functional | P0 |
| FR-708 | Notify reported user of action + reason | Functional | P0 |

**Database Schema:**
```prisma
model ModerationReport {
  id               String @id @default(cuid())
  reporterId       String
  reporter         User @relation("reporter", fields: [reporterId], references: [id])
  
  reportedUserId   String
  reportedUser     User @relation("reported", fields: [reportedUserId], references: [id])
  
  reportedItemType String    // JOB, BID, MESSAGE, PROFILE, REVIEW
  reportedItemId   String
  
  category         String    // FRAUD, HARASSMENT, LOW_QUALITY, HATE_SPEECH, OTHER
  reason           String    // free text
  evidence         String[]  // file URLs
  
  status           String    // OPEN, ASSIGNED, REVIEWING, RESOLVED, DISMISSED
  
  assignedTo       String?
  moderator        User? @relation("moderator", fields: [assignedTo], references: [id])
  
  slaDeadline      DateTime
  
  resolution       String?   // action taken
  resolutionNote   String?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  resolvedAt       DateTime?
  
  notes            ModerationReportNote[]
  auditLog         AuditLog[]
}

model ModerationReportNote {
  id               String @id @default(cuid())
  reportId         String
  report           ModerationReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  
  authorId         String    // moderator or system
  author           User @relation(fields: [authorId], references: [id])
  
  content          String
  
  createdAt        DateTime @default(now())
}
```

#### 2.6.2 Suspension & Appeal Workflow
**Requirement:** Multi-level suspension with user appeal right.

| ID | Requirement | Type | Priority |
|----|---------|------|---------|
| FR-711 | Apply soft suspend (temporary, appealable) | Functional | P0 |
| FR-712 | Apply hard suspend (requires arbitration) | Functional | P0 |
| FR-713 | User can submit appeal within 7 days | Functional | P0 |
| FR-714 | Moderator review appeal (approve / deny / request more info) | Functional | P0 |
| FR-715 | If approved: restore account, clear record after 12 months | Functional | P1 |
| FR-716 | If denied: send final decision, cannot re-appeal 30 days | Functional | P1 |
| FR-717 | Log all suspension/appeal actions in audit trail | Functional | P0 |

**Database Schema:**
```prisma
model UserSuspension {
  id               String @id @default(cuid())
  userId           String @unique
  user             User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  level            String    // WARNING, SOFT_SUSPEND, HARD_SUSPEND
  reason           String
  reportId         String?   // linked to moderation report
  
  status           String    // ACTIVE, APPEALED, RESOLVED
  
  expiresAt        DateTime? // for soft suspend
  appliedBy        String
  appliedByUser    User @relation("suspendedBy", fields: [appliedBy], references: [id])
  
  createdAt        DateTime @default(now())
  
  appeal           SuspensionAppeal?
}

model SuspensionAppeal {
  id               String @id @default(cuid())
  suspensionId     String @unique
  suspension       UserSuspension @relation(fields: [suspensionId], references: [id], onDelete: Cascade)
  
  appealReason     String
  evidence         String[]  // URLs
  
  status           String    // PENDING, APPROVED, DENIED, PENDING_MORE_INFO
  
  reviewedBy       String?
  reviewer         User? @relation(fields: [reviewedBy], references: [id])
  
  decision         String?
  decisionNote     String?
  
  createdAt        DateTime @default(now())
  decidedAt        DateTime?
}
```

---

## 3. Non-Functional Requirements

### 3.1 Security

| ID | Requirement | Type | Priority |
|----|----|------|----------|
| NFR-101 | All payment data PCI DSS compliant (handled by Stripe/Midtrans) | Non-Functional | P0 |
| NFR-102 | CSRF protection on all state-changing requests (double-submit) | Non-Functional | P0 |
| NFR-103 | Rate limit: 10 payment attempts per IP per hour | Non-Functional | P0 |
| NFR-104 | Rate limit: 5 moderation reports per user per day | Non-Functional | P1 |
| NFR-105 | Webhook signature verification (Stripe, Midtrans) | Non-Functional | P0 |
| NFR-106 | Idempotency key for payment operations (prevent duplicates) | Non-Functional | P0 |
| NFR-107 | Encrypt sensitive fields: bank account (SSE-S3 + KMS) | Non-Functional | P1 |
| NFR-108 | Audit log all admin actions (suspension, report resolution) | Non-Functional | P0 |

### 3.2 Performance

| ID | Requirement | Type | Target |
|----|----|------|--------|
| NFR-201 | Homepage load time (Lighthouse) | Non-Functional | <2s (LCP) |
| NFR-202 | Job search query response time | Non-Functional | <500ms p95 |
| NFR-203 | Recommendation batch job (1000 freelancers) | Non-Functional | <5 min |
| NFR-204 | Payment intent creation (Stripe) | Non-Functional | <2s p95 |
| NFR-205 | Webhook processing latency | Non-Functional | <1s p95 |
| NFR-206 | Database connection pool | Non-Functional | 20-50 connections |

**Optimization Tactics:**
- Job search: Elasticsearch or PostgreSQL GiST index on skills + location
- Recommendation batch: parallel processing (Bull queue)
- Caching: Redis for user subscription, plan config (TTL 1hr)

### 3.3 Scalability

| ID | Requirement | Type | Priority |
|----|----|------|----------|
| NFR-301 | Support 10,000 concurrent users | Non-Functional | P1 |
| NFR-302 | Database sharding (user_id based) if >100M records | Non-Functional | P2 |
| NFR-303 | CDN for static assets (Cloudflare) | Non-Functional | P1 |
| NFR-304 | Queue-based payment processing (not sync) | Non-Functional | P0 |
| NFR-305 | Batch job parallelization (e.g., payout, recommendations) | Non-Functional | P0 |

### 3.4 Reliability & Observability

| ID | Requirement | Type | Priority |
|----|----|------|----------|
| NFR-401 | 99.9% uptime SLA (payment system) | Non-Functional | P0 |
| NFR-402 | All errors logged to centralized system (Sentry/DataDog) | Non-Functional | P1 |
| NFR-403 | Alerts for payment webhook failures | Non-Functional | P0 |
| NFR-404 | Alerts for moderation SLA breach | Non-Functional | P0 |
| NFR-405 | Health check endpoint for payment processors | Non-Functional | P1 |
| NFR-406 | Database backups (daily, 7-day retention) | Non-Functional | P0 |

---

## 4. API Specifications

### 4.1 Payment Endpoints

#### POST /api/payments/stripe/create-intent
Create Stripe payment intent.

**Request:**
```json
{
  "amount": 500000,
  "currency": "idr",
  "contractId": "contract-uuid",
  "metadata": {
    "clientId": "user-uuid",
    "freelancerId": "user-uuid",
    "jobId": "job-uuid"
  }
}
```

**Response (200):**
```json
{
  "client_secret": "pi_1234_secret",
  "payment_intent_id": "pi_1234",
  "status": "requires_payment_method",
  "amount": 500000,
  "currency": "idr"
}
```

**Error (400):**
```json
{
  "error": "CONTRACT_NOT_FOUND",
  "message": "Contract ID invalid or already paid"
}
```

#### POST /api/payments/stripe/webhook
Handle Stripe webhook.

**Request:**
```
POST /api/payments/stripe/webhook
X-Stripe-Signature: t=timestamp,v1=signature

{
  "id": "evt_123",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234",
      "status": "succeeded",
      "amount": 500000,
      "metadata": { "contractId": "..." }
    }
  }
}
```

**Response (200):**
```json
{ "received": true }
```

#### POST /api/payments/midtrans/create-snap
Create Midtrans Snap token.

**Request:**
```json
{
  "amount": 500000,
  "contractId": "contract-uuid",
  "clientEmail": "user@example.com",
  "clientName": "John Doe"
}
```

**Response (200):**
```json
{
  "snap_token": "snap-token-123",
  "snap_redirect_url": "https://app.midtrans.com/snap/v2/...",
  "order_id": "ORDER-123"
}
```

### 4.2 Subscription Endpoints

#### GET /api/subscriptions/user
Retrieve current user subscription.

**Response (200):**
```json
{
  "id": "sub-uuid",
  "userId": "user-uuid",
  "plan": {
    "id": "plan-pro",
    "name": "PRO",
    "monthlyPrice": 999,
    "config": { "activeBids": 30, "activeContracts": 10 }
  },
  "status": "active",
  "currentPeriodStart": "2026-07-01T00:00:00Z",
  "currentPeriodEnd": "2026-08-01T00:00:00Z",
  "autoRenew": true
}
```

#### POST /api/subscriptions/upgrade
Upgrade subscription tier.

**Request:**
```json
{
  "planId": "plan-pro",
  "paymentMethod": "stripe"
}
```

**Response (200):**
```json
{
  "subscription": { /* updated subscription */ },
  "paymentUrl": "https://checkout.stripe.com/..." // if payment required
}
```

### 4.3 Moderation Endpoints

#### POST /api/moderation/reports
Submit moderation report.

**Request:**
```json
{
  "reportedUserId": "user-uuid",
  "reportedItemType": "PROFILE",
  "reportedItemId": "user-uuid",
  "category": "FRAUD",
  "reason": "User claims fake experience",
  "evidence": ["https://spaces.nearwork/evidence-1.jpg"]
}
```

**Response (201):**
```json
{
  "id": "report-uuid",
  "status": "OPEN",
  "slaDeadline": "2026-07-09T...",
  "assignedTo": null
}
```

---

## 5. Integration Points

### 5.1 Stripe
- **SDK:** @stripe/stripe-js (frontend), stripe (backend)
- **Webhooks:** payment_intent.succeeded, payment_intent.payment_failed, charge.dispute.created
- **Endpoint:** https://api.stripe.com/v1/...

### 5.2 Midtrans
- **SDK:** midtrans-client (Node.js)
- **Snap URL:** https://snap.midtrans.com/snap/pay/...
- **Callback:** POST /api/payments/midtrans/notification

### 5.3 OpenAI (for recommendation engine)
- **Model:** gpt-4-turbo or gpt-3.5-turbo
- **Usage:** Job-freelancer embedding similarity (future enhancement)

### 5.4 DigitalOcean Spaces
- **Bucket:** nearwork
- **Files:** invoices/, evidence/, portfolio/

---

## 6. Testing Requirements

### 6.1 Unit Tests
- Payment service (idempotency, retry logic)
- Subscription quota enforcement
- Recommendation scoring algorithm
- Moderation SLA calculation

### 6.2 Integration Tests
- Stripe webhook handling (mock)
- Midtrans callback validation
- Escrow state transitions
- Payout batch processing

### 6.3 End-to-End Tests
- Full payment flow: freelancer bid → client payment → escrow → work → release
- Subscription: upgrade → quota increase → downgrade
- Moderation: report → assign → resolve → appeal

---

## 7. Database Migrations

### Phase 1: Payment Schema
```sql
CREATE TABLE payment_intents (
  id UUID PRIMARY KEY,
  contract_id UUID UNIQUE NOT NULL REFERENCES contracts(id),
  stripe_intent_id VARCHAR NOT NULL UNIQUE,
  midtrans_order_id VARCHAR,
  amount INT NOT NULL,
  currency VARCHAR(3),
  status VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES contracts(id),
  type VARCHAR(20) /* CHARGE, REFUND, PAYOUT */,
  amount INT NOT NULL,
  currency VARCHAR(3),
  fee INT,
  status VARCHAR(50),
  provider VARCHAR(50),
  provider_txn_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_intents_contract ON payment_intents(contract_id);
CREATE INDEX idx_payment_transactions_contract ON payment_transactions(contract_id);
```

### Phase 2: Subscription Schema
```sql
ALTER TABLE users ADD COLUMN current_plan_id UUID REFERENCES subscription_plans(id);

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_sub_id VARCHAR UNIQUE,
  midtrans_sub_id VARCHAR UNIQUE,
  status VARCHAR(50),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);
```

---

## 8. Deployment Checklist

- [ ] Environment variables: STRIPE_SK, MIDTRANS_SK, OpenAI API key
- [ ] Database migrations: run on production
- [ ] Webhook routes: test with Stripe/Midtrans simulators
- [ ] Email templates: invoice, receipt, payout notification
- [ ] Rate limiting: configure Redis
- [ ] Monitoring: set up Sentry, DataDog alerts
- [ ] Compliance: GDPR cookie consent, UU PDP acknowledgment
- [ ] Smoke tests: full payment flow in staging

---

**End of SRS**  
Document prepared by: Dozer (Lead Engineer)  
Next review: 2026-08-15
