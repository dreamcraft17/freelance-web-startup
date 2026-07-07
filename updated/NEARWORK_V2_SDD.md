# NearWork V2 — Software Design Document (SDD)

**Document Version:** 1.0  
**Last Updated:** 2026-07-07  
**Author:** Dozer (Lead Engineer)  
**Status:** Implementation  
**Target Release:** Q3/Q4 2026

---

## 1. Architecture Overview

### 1.1 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Layer (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Checkout   │  │   Admin      │  │   Freelancer/Client  │  │
│  │   (Stripe)   │  │   Dashboard  │  │   Dashboard          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└──────────────┬──────────────────────────────────────────────────┘
               │ REST API + Webhooks
┌──────────────▼──────────────────────────────────────────────────┐
│                  API Layer (Next.js Route Handlers)              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Payment Service  │ Subscription Service │ Moderation   │   │
│  │  (Stripe/Midtrans)│ (Quota Enforcement)  │ Service      │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Recommendation Engine  │  Escrow Service  │  Billing   │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────────────────────────┘
               │ Database ORM (Prisma)
┌──────────────▼──────────────────────────────────────────────────┐
│                  Data Layer (PostgreSQL)                         │
│  User  │ Contract  │ Subscription  │ PaymentIntent  │ Moderation│
│        │ Escrow    │ Boost         │ Recommendation │ Reports   │
└──────────────┬──────────────────────────────────────────────────┘
               │
        ┌──────┴──────────────────────────────────────┐
        │                                             │
   ┌────▼────┐  ┌──────────┐  ┌────────────┐  ┌────▼────┐
   │  Stripe  │  │ Midtrans │  │ DigitalOcean  │  │ Worker  │
   │ Payments │  │ Payments │  │ Spaces (S3)   │  │ (Bull)  │
   └────────────  └──────────┘  └──────────────┘  └─────────┘
```

### 1.2 Monorepo Structure (Updated for V2)

```
freelance-web/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── payments/          [NEW] Stripe + Midtrans
│   │   │   │   ├── subscriptions/     [NEW] Subscription management
│   │   │   │   ├── boosts/            [NEW] Boost purchase
│   │   │   │   ├── moderation/        [ENHANCED] Reports + appeals
│   │   │   │   ├── escrow/            [NEW] Escrow lifecycle
│   │   │   │   ├── recommendations/   [NEW] AI matching
│   │   │   │   └── ...
│   │   │   ├── (dashboard)/           [EXISTING] Freelancer/client
│   │   │   ├── (admin)/               [ENHANCED] Analytics, billing
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── PaymentCheckout/       [NEW]
│   │   │   ├── SubscriptionManager/   [NEW]
│   │   │   ├── EscrowStatus/          [NEW]
│   │   │   ├── ModerationQueue/       [ENHANCED]
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── services/              [NEW] Service layer
│   │   │   │   ├── payment.service.ts
│   │   │   │   ├── subscription.service.ts
│   │   │   │   ├── escrow.service.ts
│   │   │   │   ├── recommendation.service.ts
│   │   │   │   └── moderation.service.ts
│   │   │   ├── policies/              [ENHANCED]
│   │   │   └── ...
│   │   └── ...
│   │
│   └── worker/
│       ├── jobs/
│       │   ├── payout.worker.ts       [NEW] Weekly payout batch
│       │   ├── recommendation.worker.ts [NEW] Daily recommendations
│       │   ├── escrow-release.worker.ts [NEW] Auto-release logic
│       │   ├── moderation-sla.worker.ts [NEW] SLA escalation
│       │   └── ...
│       └── ...
│
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma          [ENHANCED] Payment, Escrow, Boost schemas
│   │   │   └── migrations/            [NEW] V2 migrations
│   │   └── ...
│   │
│   ├── config/
│   │   ├── plans.ts                   [UPDATED] Subscription tiers
│   │   ├── entitlements.ts            [UPDATED] Feature flags
│   │   └── ...
│   │
│   └── ...
│
└── ...
```

---

## 2. Layered Architecture & Design Patterns

### 2.1 Service Layer Architecture

**Pattern: Service → Policy → Repository**

Each feature is organized into 3 layers:

#### Layer 1: Repository (Data Access)
- Direct Prisma queries
- No business logic
- Reusable query builders

```typescript
// packages/database/src/repositories/ContractRepository.ts
export class ContractRepository {
  async findById(contractId: string) {
    return prisma.contract.findUnique({
      where: { id: contractId },
      include: { job: true, client: true, freelancer: true }
    });
  }
  
  async updateStatus(contractId: string, status: ContractStatus) {
    return prisma.contract.update({
      where: { id: contractId },
      data: { status, updatedAt: new Date() }
    });
  }
  
  async getActiveContractsCount(freelancerId: string) {
    return prisma.contract.count({
      where: {
        freelancerId,
        status: { in: ['ACTIVE', 'IN_PROGRESS', 'IN_REVIEW'] }
      }
    });
  }
}
```

#### Layer 2: Policy (Business Rules)
- Enforce business rules
- Validate state transitions
- Check quotas, permissions

```typescript
// apps/web/lib/policies/SubscriptionPolicy.ts
export class SubscriptionPolicy {
  async canBidOnJob(userId: string): Promise<boolean> {
    const subscription = await getActiveSubscription(userId);
    const plan = subscription.plan;
    const config = JSON.parse(plan.config);
    
    const repository = new ContractRepository();
    const activeCount = await repository.getActiveContractsCount(userId);
    
    return activeCount < config.activeContracts;
  }
  
  async canUpgradeFromToPlan(userId: string, targetPlanId: string): Promise<boolean> {
    const currentSub = await getActiveSubscription(userId);
    const targetPlan = await prisma.subscriptionPlan.findUnique({ 
      where: { id: targetPlanId } 
    });
    
    // Rules: can upgrade to any tier, downgrade only if no contract
    if (this.isPlanDowngrade(currentSub.plan, targetPlan)) {
      const activeCount = await repository.getActiveContractsCount(userId);
      return activeCount === 0;
    }
    return true;
  }
}
```

#### Layer 3: Service (Orchestration)
- Call repositories & policies
- Orchestrate complex workflows
- Handle errors & retries
- Publish events

```typescript
// apps/web/lib/services/SubscriptionService.ts
export class SubscriptionService {
  private policy = new SubscriptionPolicy();
  private repository = new ContractRepository();
  
  async upgradeSubscription(userId: string, planId: string) {
    // Check policy
    const canUpgrade = await this.policy.canUpgradeFromToPlan(userId, planId);
    if (!canUpgrade) {
      throw new Error('Cannot downgrade with active contracts');
    }
    
    // Get plan & calculate cost
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    const currentSub = await getActiveSubscription(userId);
    const proratedCost = this.calculateProration(currentSub, plan);
    
    // Initialize payment if cost > 0
    if (proratedCost > 0) {
      const paymentIntent = await paymentService.createPaymentIntent({
        amount: proratedCost,
        userId,
        type: 'SUBSCRIPTION_UPGRADE'
      });
      return { paymentRequired: true, paymentIntentId: paymentIntent.id };
    }
    
    // Update subscription (if free upgrade)
    const newSub = await prisma.userSubscription.update({
      where: { userId },
      data: { planId, updatedAt: new Date() }
    });
    
    // Publish event for notifications, analytics
    await publishEvent('subscription.upgraded', { userId, planId });
    
    return { paymentRequired: false, subscription: newSub };
  }
}
```

### 2.2 API Endpoint Pattern

```typescript
// apps/web/app/api/subscriptions/upgrade/route.ts
import { SubscriptionService } from '@/lib/services/subscription.service';
import { auth } from '@/lib/auth';

const service = new SubscriptionService();

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    
    // 2. Validate input
    const body = await request.json();
    const { planId } = upgradeSubscriptionSchema.parse(body);
    
    // 3. Call service
    const result = await service.upgradeSubscription(session.user.id, planId);
    
    // 4. Return response
    return new Response(JSON.stringify(result), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    // 5. Handle errors
    if (error instanceof ValidationError) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
    
    // Log to Sentry, etc.
    logError(error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

### 2.3 Design Patterns Used

| Pattern | Usage | Location |
|---------|-------|----------|
| **Repository** | Data access abstraction | `@acme/database` |
| **Service** | Business logic orchestration | `lib/services/` |
| **Policy** | Rule enforcement | `lib/policies/` |
| **Factory** | Create complex objects (PaymentIntent) | `lib/factories/` |
| **Strategy** | Different payment processors (Stripe vs Midtrans) | `lib/payment-strategies/` |
| **Observer** | Event-driven (subscription changed → emit event) | EventBus (Bull queue) |
| **Decorator** | Middleware (auth, rate limit, logging) | Next.js middleware |

---

## 3. Component Architecture

### 3.1 Payment & Billing Components

#### Component Tree: Checkout Flow

```
CheckoutPage
├── OrderSummary
│   ├── ContractDetails
│   └── FeeBreakdown (subtotal, escrow fee, tax)
│
├── PaymentMethodSelector
│   ├── StripeCardForm
│   │   └── CardElement (Stripe UI)
│   └── MidtransSnapButton
│       └── Snap iframe (Midtrans)
│
└── ConfirmationModal
    ├── PaymentStatus (processing → success → error)
    └── ActionButton (download receipt, continue)
```

**Component: StripeCardForm**
```typescript
// apps/web/components/StripeCardForm.tsx
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useCallback, useState } from 'react';

export const StripeCardForm = ({ contractId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 1. Create payment intent on server
    const response = await fetch('/api/payments/stripe/create-intent', {
      method: 'POST',
      body: JSON.stringify({ contractId, amount: 500000, currency: 'idr' })
    });
    const { client_secret } = await response.json();
    
    // 2. Confirm payment with Stripe
    const result = await stripe.confirmCardPayment(client_secret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: 'John Doe' }
      }
    });
    
    if (result.error) {
      setError(result.error.message);
    } else {
      onSuccess(result.paymentIntent);
    }
    setIsLoading(false);
  }, [stripe, elements, contractId, onSuccess]);
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};
```

#### Component: SubscriptionUpgradeModal

```typescript
// apps/web/components/SubscriptionUpgradeModal.tsx
import { useState } from 'react';
import { StripeCardForm } from './StripeCardForm';
import { MidtransSnapButton } from './MidtransSnapButton';

export const SubscriptionUpgradeModal = ({ currentPlan, targetPlan, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'midtrans'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleUpgradeSuccess = async (paymentIntentId: string) => {
    setIsProcessing(true);
    
    // Call API to confirm upgrade
    const response = await fetch('/api/subscriptions/confirm-upgrade', {
      method: 'POST',
      body: JSON.stringify({ targetPlanId: targetPlan.id, paymentIntentId })
    });
    
    if (response.ok) {
      // Refresh user context + close modal
      await refreshUserSubscription();
      onClose();
    }
    
    setIsProcessing(false);
  };
  
  return (
    <div className="modal">
      <h2>Upgrade to {targetPlan.displayName}</h2>
      
      <div className="price-section">
        <p>Current: {formatPrice(currentPlan.monthlyPrice)}/month</p>
        <p>Upgrade to: {formatPrice(targetPlan.monthlyPrice)}/month</p>
        <p className="text-bold">Total due today: {formatPrice(targetPlan.monthlyPrice)}</p>
      </div>
      
      <div className="payment-methods">
        <label>
          <input type="radio" value="stripe" onChange={(e) => setPaymentMethod(e.target.value)} />
          Credit/Debit Card (Stripe)
        </label>
        <label>
          <input type="radio" value="midtrans" onChange={(e) => setPaymentMethod(e.target.value)} />
          Local Methods (Midtrans: VA, e-wallet)
        </label>
      </div>
      
      {paymentMethod === 'stripe' && (
        <StripeCardForm contractId={undefined} onSuccess={handleUpgradeSuccess} />
      )}
      
      {paymentMethod === 'midtrans' && (
        <MidtransSnapButton planId={targetPlan.id} onSuccess={handleUpgradeSuccess} />
      )}
    </div>
  );
};
```

### 3.2 Moderation Components

#### Admin Moderation Queue

```typescript
// apps/web/components/admin/ModerationQueue.tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export const ModerationQueue = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState('OPEN');
  const [sortBy, setSortBy] = useState('slaDeadline'); // soonest deadline first
  
  const { data: reports, isLoading } = useQuery(
    ['moderation-reports', filterStatus, sortBy],
    async () => {
      const response = await fetch(
        `/api/admin/moderation/reports?status=${filterStatus}&sort=${sortBy}`
      );
      return response.json();
    }
  );
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Queue list */}
      <div className="col-span-1">
        <div className="filter-bar">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="slaDeadline">SLA Deadline (nearest)</option>
            <option value="createdAt">Newest First</option>
            <option value="priority">High Priority</option>
          </select>
        </div>
        
        <div className="report-list">
          {isLoading ? <p>Loading...</p> : (
            reports?.map(report => (
              <div
                key={report.id}
                className={`report-card ${selectedReport?.id === report.id ? 'active' : ''}`}
                onClick={() => setSelectedReport(report)}
              >
                <div className="header">
                  <span className="badge">{report.category}</span>
                  <span className={`sla ${report.slaStatus}`}>
                    {formatDistanceToNow(new Date(report.slaDeadline))}
                  </span>
                </div>
                <p className="user">{report.reportedUser.name}</p>
                <p className="reason">{report.reason.substring(0, 50)}...</p>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Report detail */}
      {selectedReport && (
        <ReportDetail report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
};

const ReportDetail = ({ report, onClose }) => {
  const [isResolving, setIsResolving] = useState(false);
  const [action, setAction] = useState('WARNING');
  const [notes, setNotes] = useState('');
  
  const handleResolve = async () => {
    setIsResolving(true);
    
    const response = await fetch(`/api/admin/moderation/reports/${report.id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action, notes })
    });
    
    if (response.ok) {
      toast.success('Report resolved');
      onClose();
    }
    
    setIsResolving(false);
  };
  
  return (
    <div className="col-span-2 detail-panel">
      <div className="header">
        <h3>Report #{report.id.slice(0, 8)}</h3>
        <button onClick={onClose}>✕</button>
      </div>
      
      <div className="section">
        <h4>Reported User</h4>
        <UserCard user={report.reportedUser} />
      </div>
      
      <div className="section">
        <h4>Report Details</h4>
        <p><strong>Category:</strong> {report.category}</p>
        <p><strong>Reason:</strong> {report.reason}</p>
        <p><strong>Evidence:</strong></p>
        <div className="evidence-gallery">
          {report.evidence?.map((url, i) => (
            <img key={i} src={url} alt={`evidence-${i}`} />
          ))}
        </div>
      </div>
      
      <div className="section">
        <h4>Resolution</h4>
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="WARNING">Warning (email)</option>
          <option value="SOFT_SUSPEND">Soft Suspend (7 days)</option>
          <option value="HARD_SUSPEND">Hard Suspend (pending appeal)</option>
          <option value="DISMISS">Dismiss (no action)</option>
        </select>
        
        <textarea
          placeholder="Internal notes (for moderators)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        
        <button
          onClick={handleResolve}
          disabled={isResolving}
          className="btn btn-primary"
        >
          {isResolving ? 'Resolving...' : 'Resolve Report'}
        </button>
      </div>
    </div>
  );
};
```

---

## 4. Worker Jobs Architecture

### 4.1 Background Job Queue (Bull/BullMQ)

```typescript
// apps/worker/src/queues/index.ts
import Queue from 'bull';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Define job queues
export const payoutQueue = new Queue('payout', { redis });
export const recommendationQueue = new Queue('recommendation', { redis });
export const escrowReleaseQueue = new Queue('escrow-release', { redis });
export const moderationSlaQueue = new Queue('moderation-sla', { redis });
export const invoiceQueue = new Queue('invoice', { redis });

// Register job handlers
payoutQueue.process(payoutHandler);
recommendationQueue.process(recommendationHandler);
escrowReleaseQueue.process(escrowReleaseHandler);
moderationSlaQueue.process(moderationSlaHandler);
invoiceQueue.process(invoiceHandler);
```

### 4.2 Payout Worker

```typescript
// apps/worker/src/jobs/payout.worker.ts
export async function payoutHandler(job: Job) {
  console.log('Starting batch payout...');
  
  const pendingPayouts = await prisma.payoutRequest.findMany({
    where: { status: 'PENDING', requestedAt: { lte: new Date() } },
    include: { freelancer: { include: { bankAccount: true } } },
    take: 100 // Batch size
  });
  
  const results = [];
  
  for (const payout of pendingPayouts) {
    try {
      // Validate bank account
      if (!payout.freelancer.bankAccount) {
        throw new Error('No bank account on file');
      }
      
      // Call bank/payment processor API
      const receipt = await bankAPI.transfer({
        bankCode: payout.freelancer.bankAccount.bankCode,
        accountNumber: payout.freelancer.bankAccount.accountNumber,
        accountName: payout.freelancer.bankAccount.accountName,
        amount: payout.amount,
        description: 'NearWork earnings payout'
      });
      
      // Update payout record
      await prisma.payoutRequest.update({
        where: { id: payout.id },
        data: {
          status: 'SENT',
          receiptId: receipt.id,
          sentAt: new Date(),
          processedAt: new Date()
        }
      });
      
      // Publish event for email notification
      await publishEvent('payout.sent', {
        freelancerId: payout.freelancerId,
        amount: payout.amount,
        receiptId: receipt.id
      });
      
      results.push({ payoutId: payout.id, status: 'success' });
      
    } catch (error) {
      console.error(`Payout ${payout.id} failed:`, error);
      
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
      
      // If max retries exceeded, escalate to admin
      if (payout.retryCount >= 3) {
        await publishEvent('payout.failed_manual_review', {
          payoutId: payout.id,
          reason: error.message
        });
      }
      
      results.push({ payoutId: payout.id, status: 'failed', error: error.message });
    }
  }
  
  return { processed: results.length, results };
}

// Cron trigger (every Monday midnight)
export function schedulePayoutJob() {
  const schedule = '0 0 * * 1'; // Monday 00:00 UTC
  cron.schedule(schedule, async () => {
    await payoutQueue.add({}, { repeat: { cron: schedule } });
  });
}
```

### 4.3 Recommendation Worker

```typescript
// apps/worker/src/jobs/recommendation.worker.ts
export async function recommendationHandler(job: Job) {
  console.log('Generating daily recommendations...');
  
  // Get all active freelancers
  const freelancers = await prisma.freelancerProfile.findMany({
    where: { user: { deletedAt: null } },
    include: {
      user: { include: { skills: true } },
      portfolio: { include: { skills: true } }
    }
  });
  
  let recommendationCount = 0;
  
  for (const freelancer of freelancers) {
    try {
      // Extract freelancer data
      const skills = extractSkills(freelancer);
      const category = freelancer.primaryCategory;
      const location = freelancer.location;
      
      // Get open jobs (exclude already bid)
      const openJobs = await prisma.job.findMany({
        where: {
          status: 'OPEN',
          expiresAt: { gt: new Date() },
          bids: {
            none: { freelancerId: freelancer.userId }
          }
        },
        include: { skills: true }
      });
      
      // Score each job
      const scoredJobs = openJobs.map(job => {
        const skillScore = computeJaccardSimilarity(skills, job.skills) * 40;
        const categoryScore = (job.category === category ? 1 : 0.5) * 30;
        const locationScore = computeLocationScore(location, job.location) * 20;
        const experienceScore = (freelancer.averageRating / 5) * 10;
        
        const totalScore = skillScore + categoryScore + locationScore + experienceScore;
        
        return {
          jobId: job.id,
          score: Math.round(totalScore),
          reasons: generateReasons(skillScore, categoryScore, locationScore, experienceScore)
        };
      });
      
      // Filter & sort
      const topJobs = scoredJobs
        .filter(j => j.score >= 50)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Top 10 per freelancer
      
      // Create recommendation records
      for (const job of topJobs) {
        // Skip if already recommended in last 7 days
        const existing = await prisma.recommendation.findFirst({
          where: {
            freelancerId: freelancer.userId,
            jobId: job.jobId,
            createdAt: { gt: subDays(new Date(), 7) }
          }
        });
        
        if (!existing) {
          await prisma.recommendation.create({
            data: {
              freelancerId: freelancer.userId,
              jobId: job.jobId,
              score: job.score,
              matchReasons: job.reasons,
              expiresAt: addDays(new Date(), 30)
            }
          });
          recommendationCount++;
        }
      }
      
    } catch (error) {
      console.error(`Error processing freelancer ${freelancer.userId}:`, error);
      // Continue with next freelancer
    }
  }
  
  // Publish daily digest emails (async)
  await publishEvent('recommendations.generated', {
    freelancerCount: freelancers.length,
    recommendationCount
  });
  
  return { freelancersProcessed: freelancers.length, recommendationsCreated: recommendationCount };
}

function computeJaccardSimilarity(setA: string[], setB: string[]): number {
  const intersection = setA.filter(x => setB.includes(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function computeLocationScore(freelancerLoc: { lat: number, lng: number }, jobLoc: { lat: number, lng: number }): number {
  const distance = getHaversineDistance(freelancerLoc, jobLoc); // km
  
  // Closer = higher score (max 50km = 1.0 score, degrades with distance)
  if (distance <= 50) return 1.0;
  if (distance <= 100) return 0.7;
  if (distance <= 500) return 0.3;
  return 0.1; // Remote job, still relevant
}
```

---

## 5. Database Schema (V2 Additions)

### 5.1 Payment & Escrow Tables

```prisma
// packages/database/prisma/schema.prisma

model PaymentIntent {
  id               String @id @default(cuid())
  contractId       String @unique
  contract         Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
  
  stripeIntentId   String? @unique
  midtransOrderId  String? @unique
  
  amount           Int       // cents
  currency         String    // usd, idr
  status           String    // requires_payment_method, processing, succeeded, failed
  
  metadata         Json?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@index([contractId])
  @@index([stripeIntentId])
}

model EscrowTransaction {
  id               String @id @default(cuid())
  contractId       String
  contract         Contract @relation("escrowTransactions", fields: [contractId], references: [id], onDelete: Cascade)
  
  type             String    // LOCK, PARTIAL_RELEASE, FULL_RELEASE, REFUND
  amount           Int
  reason           String?
  createdBy        String?
  
  createdAt        DateTime @default(now())
  
  @@index([contractId])
  @@index([createdAt])
}

model ContractDispute {
  id               String @id @default(cuid())
  contractId       String @unique
  contract         Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
  
  initiatedBy      String
  reason           String
  evidence         String[] // URLs
  
  assignedTo       String?
  moderator        User? @relation("disputeModerator", fields: [assignedTo], references: [id])
  
  status           String    // OPEN, REVIEWING, RESOLVED, APPEALED
  decision         String?   // FAVOR_CLIENT, FAVOR_FREELANCER, SPLIT
  resolution       String?
  
  resolutionAt     DateTime?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### 5.2 Subscription & Boost Tables

```prisma
model SubscriptionPlan {
  id               String @id @default(cuid())
  name             String @unique // FREE, PRO, AGENCY
  displayName      String
  monthlyPrice     Int    // cents, 0 for FREE
  currency         String
  
  config           Json   // { activeBids: 5, activeContracts: 2 }
  features         String[]
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model UserSubscription {
  id               String @id @default(cuid())
  userId           String @unique
  user             User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  planId           String
  plan             SubscriptionPlan @relation(fields: [planId], references: [id])
  
  stripeSubId      String? @unique
  midtransSubId    String? @unique
  
  status           String    // active, past_due, canceled, paused
  currentPeriodStart DateTime
  currentPeriodEnd DateTime
  
  autoRenew        Boolean @default(true)
  canceledAt       DateTime?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Boost {
  id               String @id @default(cuid())
  userId           String
  user             User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  productId        String
  product          BoostProduct @relation(fields: [productId], references: [id])
  
  targetType       String    // JOB, PROFILE
  targetId         String
  
  status           String    // ACTIVE, EXPIRED, PAUSED
  expiresAt        DateTime
  
  paymentTxnId     String?
  
  createdAt        DateTime @default(now())
  expiredAt        DateTime?
  
  @@index([userId])
  @@index([expiresAt])
  @@index([targetType, targetId])
}

model BoostProduct {
  id               String @id @default(cuid())
  name             String
  type             String    // JOB_BOOST, PROFILE_FEATURE, TOP_FREELANCER_BADGE
  durationDays     Int
  price            Int       // cents
  
  config           Json      // impressionMultiplier, etc.
  
  createdAt        DateTime @default(now())
  
  boosts           Boost[]
}
```

### 5.3 Moderation Tables

```prisma
model ModerationReport {
  id               String @id @default(cuid())
  reporterId       String
  reporter         User @relation("reporterReports", fields: [reporterId], references: [id])
  
  reportedUserId   String
  reportedUser     User @relation("reportedReports", fields: [reportedUserId], references: [id])
  
  reportedItemType String    // JOB, BID, MESSAGE, PROFILE
  reportedItemId   String
  
  category         String    // FRAUD, HARASSMENT, LOW_QUALITY, HATE_SPEECH
  reason           String
  evidence         String[]
  
  status           String    // OPEN, ASSIGNED, REVIEWING, RESOLVED, DISMISSED
  
  assignedTo       String?
  moderator        User? @relation("moderatorAssignments", fields: [assignedTo], references: [id])
  
  slaDeadline      DateTime
  slaStatus        String    // ON_TRACK, AT_RISK, OVERDUE
  
  resolution       String?
  resolutionNote   String?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  resolvedAt       DateTime?
  
  notes            ModerationReportNote[]
  auditLogs        AuditLog[]
  
  @@index([status])
  @@index([slaDeadline])
  @@index([assignedTo])
}

model ModerationReportNote {
  id               String @id @default(cuid())
  reportId         String
  report           ModerationReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  
  authorId         String
  author           User @relation(fields: [authorId], references: [id])
  
  content          String
  
  createdAt        DateTime @default(now())
}

model UserSuspension {
  id               String @id @default(cuid())
  userId           String @unique
  user             User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  level            String    // WARNING, SOFT_SUSPEND, HARD_SUSPEND
  reason           String
  
  status           String    // ACTIVE, APPEALED, RESOLVED
  expiresAt        DateTime?
  
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
  evidence         String[]
  
  status           String    // PENDING, APPROVED, DENIED
  
  reviewedBy       String?
  reviewer         User? @relation(fields: [reviewedBy], references: [id])
  
  decision         String?
  decisionNote     String?
  
  createdAt        DateTime @default(now())
  decidedAt        DateTime?
}
```

---

## 6. State Machines

### 6.1 Contract Lifecycle (Escrow)

```
[OPEN] ──bid accepted──> [BID_ACCEPTED]
                              │
                              ▼
                        [PAYMENT_PENDING]
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         (timeout)        (success)      (failed)
              │               │               │
              ▼               ▼               ▼
         [CANCELED]  [PAYMENT_CONFIRMED] [PAYMENT_FAILED]
                              │
                              ▼
                        [IN_PROGRESS] ◄── freelancer works
                              │
                              ▼
                        [IN_REVIEW] ◄── freelancer submits work
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                 (approve) (dispute) (revise)
                    │         │         │
                    ▼         ▼         ▼
                [COMPLETED] [DISPUTED] [IN_PROGRESS]
                    │         │
                    ▼         ▼
                [RELEASED] [ARBITRATING]
                            │
                  ┌─────────┬┴─────────┐
                  │         │          │
              (favor_c) (favor_f)  (split)
                  │         │          │
                  ▼         ▼          ▼
              [REFUND]  [RELEASED]  [RESOLVED]
```

### 6.2 Moderation Report Workflow

```
[SUBMITTED] ──auto-assign──> [ASSIGNED]
                                 │
                                 ▼
                           [REVIEWING]
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
               (warning)      (suspend)   (dismiss)
                    │            │            │
                    ▼            ▼            ▼
               [WARNED]    [SUSPENDED]    [DISMISSED]
                    │            │
                    └────────────┼────────────┐
                                 │            │
                            (appeal)      (no appeal)
                                 │            │
                                 ▼            ▼
                           [APPEALING]  [FINAL]
                                 │
                        ┌────────┼────────┐
                        │        │        │
                   (approved)  (denied)
                        │        │
                        ▼        ▼
                   [RESTORED]  [FINAL]
```

---

## 7. Security & Error Handling

### 7.1 Payment Security Checklist

- [ ] Never store credit card numbers locally
- [ ] Use Stripe/Midtrans for tokenization
- [ ] Validate webhook signatures (X-Stripe-Signature, SHA512)
- [ ] Implement idempotency keys for payment operations
- [ ] Rate limit payment endpoints (10/hour per IP)
- [ ] Log all payment transactions to audit trail
- [ ] Implement chargeback detection & monitoring
- [ ] PCI compliance: run annual penetration testing

### 7.2 Error Recovery Patterns

**Payment Failure Retry:**
```typescript
async function retryPaymentIntent(intentId: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await stripe.paymentIntents.confirm(intentId);
      if (result.status === 'succeeded') return result;
    } catch (error) {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await sleep(delay);
      if (attempt === maxRetries - 1) throw error;
    }
  }
}
```

**Webhook Idempotency:**
```typescript
async function handleWebhook(event: StripeEvent) {
  // Check if event already processed
  const processed = await prisma.webhookEvent.findUnique({
    where: { stripeEventId: event.id }
  });
  
  if (processed) {
    return { received: true }; // Duplicate, skip
  }
  
  // Process event
  try {
    // ... business logic ...
    
    // Mark as processed
    await prisma.webhookEvent.create({
      data: { stripeEventId: event.id, processedAt: new Date() }
    });
  } catch (error) {
    // Log & alert, don't fail (will retry)
    logError(error);
  }
  
  return { received: true };
}
```

---

## 8. Monitoring & Observability

### 8.1 Key Metrics to Track

```typescript
// apps/web/lib/monitoring.ts
import * as Sentry from "@sentry/nextjs";

export function trackPaymentMetric(intent: PaymentIntent) {
  Sentry.captureMessage(
    `payment.created amount=${intent.amount} currency=${intent.currency}`,
    'info'
  );
}

export function trackRecommendationMetric(jobId: string, freelancerId: string, score: number) {
  Sentry.captureMessage(
    `recommendation.created job=${jobId} freelancer=${freelancerId} score=${score}`,
    'info'
  );
}

export function alertModerationSLABreach(reportId: string, category: string) {
  Sentry.captureException(
    new Error(`Moderation SLA breach: ${reportId} (${category})`),
    { level: 'warning' }
  );
}
```

### 8.2 Dashboards (DataDog/Grafana)

- **Payments:** Success rate, avg processing time, failed intents, chargeback rate
- **Subscriptions:** Active subscribers, churn rate, upgrade rate, MRR
- **Recommendations:** Generated/day, CTR, bid conversion rate
- **Moderation:** Queue size, avg resolution time, SLA compliance, appeals rate

---

## 9. Deployment Strategy

### Phase 1: Infrastructure Setup (Week 1)
- [ ] Set up Stripe/Midtrans sandbox accounts
- [ ] Configure webhook endpoints
- [ ] Set up Redis cluster for job queue
- [ ] Migrate database schema (Payment, Subscription tables)

### Phase 2: Backend Implementation (Weeks 2-3)
- [ ] Implement PaymentService, SubscriptionService
- [ ] Implement worker jobs (payout, recommendations, escrow-release)
- [ ] Write unit & integration tests
- [ ] Deploy to staging

### Phase 3: Frontend & UI (Week 4)
- [ ] Implement Stripe/Midtrans checkout components
- [ ] Implement admin moderation dashboard
- [ ] E2E testing

### Phase 4: Launch & Monitoring (Week 5)
- [ ] Full payment flow QA
- [ ] Webhook testing with live Stripe account
- [ ] Set up monitoring alerts
- [ ] Documentation & runbook

---

**End of SDD**  
Document prepared by: Dozer (Lead Engineer)  
Next review: 2026-08-15
