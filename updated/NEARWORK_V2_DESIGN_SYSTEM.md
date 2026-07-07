# NearWork V2 — UI/UX Design Document

**Document Version:** 1.0  
**Last Updated:** 2026-07-07  
**Author:** Dozer (CEO & Lead Engineer) + Design Lead  
**Status:** Implementation  
**Target Release:** Q3/Q4 2026  
**Benchmark:** Fastwork, Upwork, Fiverr

---

## Executive Summary

NearWork V2 redesign fokus pada **conversion optimization** & **trust building**, mengadopsi best practices dari Fastwork (UX lokal), Upwork (trust signal), & Fiverr (simplicity). Target: **mobilefirst responsive**, **fast loading**, **intuitive payment flow**, **clear trust indicators**.

**Key Improvements:**
1. ✅ Cleaner landing page (hero → search → social proof)
2. ✅ Fast job discovery (filter → preview → bid in 3 clicks)
3. ✅ Transparent pricing (no hidden fees)
4. ✅ Trust badges (verified, ratings, portfolio)
5. ✅ Frictionless checkout (saved payment methods)
6. ✅ Mobile-optimized (PWA, fast tap targets)
7. ✅ Accessibility (WCAG 2.1 AA)

---

## 1. Design System

### 1.1 Color Palette

**Primary Colors:**
```
Primary Blue:        #0066CC (action, CTA)
Primary Teal:        #00B8A9 (success, trust)
Accent Orange:       #FF6B35 (alerts, warnings, boosts)
Dark Gray:           #1A1A1A (text, headers)
Light Gray:          #F5F7FA (backgrounds)
White:               #FFFFFF (cards, surfaces)
```

**Semantic Colors:**
```
Success:    #10B981 (approval, verified, completed)
Warning:    #F59E0B (pending, review, caution)
Danger:     #EF4444 (error, suspension, critical)
Info:       #3B82F6 (information, tips)
Neutral:    #6B7280 (secondary text, disabled)
```

**Accessibility:**
- ✅ All primary buttons: WCAG AAA contrast (7:1 minimum)
- ✅ Hover/focus states: distinct, not color-only
- ✅ Dark mode support (toggle in settings)

### 1.2 Typography System

**Font Family:**
```
Headings:     Inter Bold (sans-serif)
Body:         Inter Regular (sans-serif)
Monospace:    Fira Code (code, prices)
```

**Type Scale:**
```
H1 (Hero):           40px / 48px  | font-weight: 700 | line-height: 1.2
H2 (Page Title):     32px / 40px  | font-weight: 700 | line-height: 1.25
H3 (Section):        24px / 32px  | font-weight: 600 | line-height: 1.33
H4 (Subsection):     20px / 28px  | font-weight: 600 | line-height: 1.4
Body XL:             18px / 28px  | font-weight: 400 | line-height: 1.55
Body (default):      16px / 24px  | font-weight: 400 | line-height: 1.5
Body SM:             14px / 20px  | font-weight: 400 | line-height: 1.43
Caption:             12px / 16px  | font-weight: 500 | line-height: 1.33
```

**Design Principle:** Hierarchy clear, generous whitespace, readable on mobile (min 16px body).

### 1.3 Spacing System

**8px base unit:**
```
xs:    4px  (inline spacing, small gaps)
sm:    8px  (component padding)
md:    16px (section spacing)
lg:    24px (block spacing)
xl:    32px (section gaps)
2xl:   48px (major layout gaps)
3xl:   64px (hero section spacing)
```

**Examples:**
```
Card padding:           16px (sm = 1 unit)
Section margin:         24-32px (lg = 1.5 units)
Button padding:         12px vertical, 16px horizontal
Input field height:     40px (for touch targets)
```

### 1.4 Component Library (shadcn/ui + Tailwind)

**Core Components Used:**
```
✅ Button (primary, secondary, outline, ghost)
✅ Card (elevated, bordered)
✅ Input (text, email, number, textarea)
✅ Select (dropdown, multi-select)
✅ Dialog/Modal (confirmation, forms)
✅ Alert (success, warning, error, info)
✅ Badge (status, category, skill tag)
✅ Avatar (user profile picture)
✅ Tabs (navigation, content switcher)
✅ Slider (range, price filter)
✅ Checkbox / Radio (form controls)
✅ Tooltip (hint, helper text)
✅ Popover (quick action menu)
✅ Skeleton (loading state)
✅ Toast (notification)
```

**Custom Components:**
```
✅ TrustBadge (verified ✓, rating ⭐, review count)
✅ PriceDisplay (currency, formatting, fee breakdown)
✅ ProfileCard (avatar, name, rating, skills, action)
✅ JobCard (title, budget, category, location, saved heart)
✅ BidCard (freelancer info, bid amount, message preview)
✅ EscrowStatus (locked 🔒, released ✓, timeline)
✅ SkillTag (removable, selectable, searchable)
✅ StatusBadge (OPEN, IN_PROGRESS, COMPLETED, DISPUTED)
✅ RecommendationScore (0-100 visual bar, match reasons)
✅ ModeratorQueueItem (category, urgency, SLA countdown)
```

### 1.5 Icons

**Icon Library:** `lucide-react` (lightweight, consistent)

**Common Icons:**
```
Search:        Search
Job:           Briefcase
Freelancer:    User
Message:       MessageCircle
Notification:  Bell
Star:          Star (filled/outline)
Heart:         Heart (filled/outline)
Share:         Share2
Close:         X
Menu:          Menu
Check:         Check
Clock:         Clock
MapPin:        MapPin
DollarSign:    DollarSign
Lock:          Lock
Eye:           Eye
EyeOff:        EyeOff
MoreVertical:  MoreVertical (actions)
TrendingUp:    TrendingUp (analytics)
```

---

## 2. Landing Page & Navigation

### 2.1 Landing Page Flow

**Benchmark Analysis:**
- **Fastwork:** Simple hero, immediate call-to-action, job categories below fold
- **Upwork:** Hero → featured freelancers → how it works → pricing
- **Fiverr:** Hero → categories → gigs → social proof

**NearWork V2 Landing Page Structure:**

```
┌─────────────────────────────────────────┐
│   NAVBAR (sticky)                       │
│  NearWork | [Jobs] [Freelancers] [Help] │
│                                [Login] [Sign Up]
│                                                  │
├─────────────────────────────────────────┤
│         HERO SECTION (60vh)             │
│                                         │
│    "Hire Top Freelancers. Fast."        │
│    "Find jobs that match your skills."  │
│                                         │
│    [Search Box: "What do you need?"]    │
│    [Submit Button: "Search" or "Browse"]│
│                                         │
│    ⭐⭐⭐⭐⭐ "5.0" (1,234 reviews)    │
│    "Join 5K+ freelancers earning daily" │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  QUICK BROWSE CATEGORIES (Section 2)    │
│                                         │
│  [Design] [Development] [Writing]       │
│  [Marketing] [Video] [Business]         │
│  [View All Categories]                  │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  FEATURED JOBS (Section 3)              │
│                                         │
│  [Job Card 1] [Job Card 2] [Job Card 3] │
│  Each: title, budget, location, tags   │
│  [View All Jobs →]                      │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  HOW IT WORKS (Section 4)               │
│                                         │
│  For Clients:           For Freelancers:│
│  1. Post a job          1. Browse jobs  │
│  2. Review bids         2. Bid          │
│  3. Hire & escrow ✓     3. Get hired    │
│  4. Release payment     4. Get paid     │
│                                         │
│  [Start Hiring] [Start Earning]         │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  SOCIAL PROOF (Section 5)               │
│                                         │
│  "Successfully Completed Contracts"     │
│  [123] [456] [789] (large numbers)      │
│                                         │
│  "Trusted by"                           │
│  [Logo 1] [Logo 2] [Logo 3]             │
│                                         │
│  Testimonials (3 cards with avatars)    │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TRUST & SAFETY (Section 6)             │
│                                         │
│  🔒 Escrow Protection                   │
│     "Money held until work approved"    │
│                                         │
│  ✓ Verified Users                       │
│     "All freelancers vetted"            │
│                                         │
│  💬 Secure Messaging                    │
│     "Keep all conversations in one place"│
│                                         │
│  ⭐ Quality Reviews                     │
│     "Transparent feedback from clients" │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  CTA & FAQ (Section 7)                  │
│                                         │
│  "Ready to get started?"                │
│  [Sign Up as Client] [Sign Up as Freelancer]
│                                         │
│  FAQ Accordion:                         │
│  Q: How does escrow work?               │
│  Q: How are freelancers verified?       │
│  Q: What fees do you charge?            │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  FOOTER                                 │
│  © 2026 NearWork. [Terms] [Privacy] [Contact] │
│  [Social Links]                         │
└─────────────────────────────────────────┘
```

**Mobile Optimization:**
- Hero section: 40vh (not full screen, scroll shows value prop)
- Search box: full-width input, prominent
- Cards stack vertically, full-width
- Touch targets: min 44px height
- Hamburger menu for nav (collapse at 768px)

### 2.2 Navigation & Header

**Desktop Header (sticky):**
```
┌──────────────────────────────────────────────────────────────┐
│ 🎯 NearWork  [Search Jobs] [Freelancers] [Help] [Notifications]│
│                                          [Profile ▼] [Logout] │
└──────────────────────────────────────────────────────────────┘
```

**Mobile Header (sticky):**
```
┌──────────────────────────────────────────────────────────────┐
│ ☰  NearWork                    [🔔] [👤]                     │
└──────────────────────────────────────────────────────────────┘

[If menu open]
├─ Search Jobs
├─ Freelancers
├─ My Dashboard
├─ Messages
├─ Help & Support
├─ Settings
└─ Logout
```

**Navigation Depth:**
- Landing page `/`
- Jobs board `/jobs`
- Freelancers directory `/freelancers`
- Dashboard `/[role]/dashboard` (freelancer or client)
- Messages `/messages`
- Help `/help`
- Pricing `/pricing`

---

## 3. Key User Flows & Wireframes

### 3.1 Job Posting Flow (Client)

**6-Step Process (minimize friction):**

**Step 1: Basic Info**
```
┌─────────────────────────────────────┐
│ Post a New Job (1/6)                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                     │
│ Job Title *                         │
│ [Text input: "Logo Design"]         │
│                                     │
│ Category *                          │
│ [Dropdown: Design ▼]                │
│                                     │
│ Description *                       │
│ [Text area: "I need a logo..."]     │
│                                     │
│ Budget *                            │
│ [Currency: IDR ▼] [Amount: 500000]  │
│                                     │
│ Duration *                          │
│ [Dropdown: < 1 week ▼]              │
│                                     │
│              [← Back] [Continue →]  │
│                                     │
└─────────────────────────────────────┘
```

**Step 2: Skills & Qualifications**
```
┌─────────────────────────────────────┐
│ What skills do you need? (2/6)      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                     │
│ Add Skills (start typing)           │
│ [Input: "Graphic Design"] ✕         │
│ [Input: "Figma"] ✕                  │
│ [Input: "Brand Strategy"] ✕         │
│ + Add more                          │
│                                     │
│ Experience Level *                  │
│ ○ Entry Level                       │
│ ○ Intermediate                      │
│ ○ Expert                            │
│                                     │
│ Preferred Freelancer Type           │
│ ☐ Freelancer                        │
│ ☐ Agency                            │
│                                     │
│              [← Back] [Continue →]  │
│                                     │
└─────────────────────────────────────┘
```

**Step 3: Scope & Details**
```
┌─────────────────────────────────────┐
│ Project Scope (3/6)                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                     │
│ Type *                              │
│ ○ One-time project                  │
│ ○ Ongoing / Hourly                  │
│                                     │
│ Work Location *                     │
│ ○ Remote                            │
│ ○ On-site                           │
│ ○ Hybrid                            │
│ [If on-site, show city picker]      │
│                                     │
│ Attachments (optional)              │
│ [Drag files or click to upload]     │
│                                     │
│              [← Back] [Continue →]  │
│                                     │
└─────────────────────────────────────┘
```

**Step 4: Screening Questions** (optional)
**Step 5: Review & Preview**
**Step 6: Publish**

**Mobile: Collapsible steps** (not carousel, swipe confuses users)

---

### 3.2 Freelancer Discovery & Bid Flow

**A. Search & Filter (Mobile-first)**

```
┌──────────────────────────────┐
│ [Search jobs...]             │ ← sticky
│ [Filters ☰]                  │ ← expandable
└──────────────────────────────┘

[When filters open - full screen overlay]
┌──────────────────────────────┐
│ Filters           [← Back] [✓]
│
│ Budget Range
│ [IDR] ₦[50000] ──●──── [5M]  ← slider
│
│ Category
│ ☐ Design
│ ☐ Development
│ ☐ Writing
│ [+ 5 more]
│
│ Experience Needed
│ ○ Entry (0-1 yr)
│ ○ Intermediate (1-3 yr)
│ ○ Expert (3+ yr)
│
│ Location
│ ○ Remote
│ ○ On-site
│ ○ Hybrid
│ [City filter if on-site]
│
│ [Clear Filters] [Apply] ✓
└──────────────────────────────┘

[Results List]
┌──────────────────────────────┐
│ Logo Design                  │
│ 🌟 ⭐⭐⭐⭐⭐ (124 reviews)  │
│ Budget: IDR 500,000          │
│ Remote · Design · Urgent     │
│ ❤️ [Save]                     │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Website Redesign             │
│ 📍 Jakarta · On-site         │
│ Budget: IDR 5,000,000        │
│ 🌟⭐⭐⭐⭐ (87 reviews)      │
│ [View Job]                   │
└──────────────────────────────┘
```

**B. Job Detail Page**

```
┌────────────────────────────────────┐
│ [← Back to Results] [❤️ Save] [⋮]  │
├────────────────────────────────────┤
│                                    │
│ Logo Design                        │
│ 🌟⭐⭐⭐⭐⭐ (124 reviews)         │
│ Budget: IDR 500,000                │
│ Remote · Design · 5 days duration  │
│ Posted 2 hours ago · 3 bids        │
│                                    │
├────────────────────────────────────┤
│ About this job                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ I need a modern logo for my startup│
│ tech company. Looking for someone  │
│ with experience in tech branding.  │
│                                    │
│ Requirements:                      │
│ • 3+ years logo design experience  │
│ • Portfolio with tech brands       │
│ • Can deliver in 5 days            │
│                                    │
├────────────────────────────────────┤
│ Client Info                        │
│ ┌────────────────────────────────┐ │
│ │ [Avatar] John S.               │ │
│ │ 🌟 4.8 (234 jobs, 98% hired)   │ │
│ │ ✓ Verified buyer               │ │
│ │ 💬 Response time: < 1 hour     │ │
│ │ 🕐 Online now                  │ │
│ │ [Message] [View Profile]       │ │
│ └────────────────────────────────┘ │
│                                    │
├────────────────────────────────────┤
│ 🔒 Escrow Protection               │
│ Payment is held safely until work  │
│ is delivered and approved.         │
│                                    │
├────────────────────────────────────┤
│ [SEND BID] ← Primary CTA           │
│ [SAVE FOR LATER]                   │
│                                    │
└────────────────────────────────────┘
```

**C. Send Bid Modal**

```
┌─────────────────────────────────────┐
│ Submit Your Bid          [✕]        │
├─────────────────────────────────────┤
│                                     │
│ Your Bid Amount *                   │
│ [IDR] [400000] [← Suggested: 500k]  │
│                                     │
│ Cover Letter *                      │
│ [Text area: "I have 5 years..."]    │
│                                     │
│ Timeline *                          │
│ [Dropdown: 5 days ▼]                │
│                                     │
│ Attachments                         │
│ [+ Upload portfolio samples]        │
│                                     │
│ ☑ I agree to T&Cs                   │
│                                     │
│ ✓ You have [4/5] active bids left   │
│ [Upgrade to PRO for unlimited] →    │
│                                     │
│              [Cancel] [Submit Bid]  │
│                                     │
└─────────────────────────────────────┘
```

**After Submit → Confirmation Toast**
```
✓ Bid submitted successfully!
  "Client will review your bid soon"
  [View Bid] [Back to Search]
```

---

### 3.3 Payment & Checkout Flow

**Current Gap (V1):** No payment UI yet. **V2 fixes:**

**A. Payment Initiation**
```
┌────────────────────────────────┐
│ Contract Summary               │ ← sticky
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                │
│ Logo Design Revision           │
│ Freelancer: Alex D.            │
│ Bid Amount:       IDR 400,000  │
│ Escrow Fee (2%):  IDR 8,000    │
│ Tax (PPN 10%):    IDR 40,800   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Total Due:        IDR 448,800  │
│                                │
│ Payment Method *               │
│ ○ Debit Card (Stripe)          │
│ ○ Credit Card (Stripe)         │
│ ○ Bank Transfer (Midtrans VA)  │
│ ○ E-wallet (GCash, OVO)        │
│                                │
├────────────────────────────────┤
│                                │
│ [If Stripe selected]           │
│ Card Details                   │
│ [Card Number: •••• 4242]       │
│ [MM/YY] [CVC]                  │
│ [Save card for future]         │
│                                │
│ [If Midtrans selected]         │
│ [Show Snap iframe →]           │
│                                │
├────────────────────────────────┤
│ ☑ I agree to escrow terms      │
│ ☑ I confirm this bid is correct│
│                                │
│ [Cancel] [Pay Now]             │
│                                │
└────────────────────────────────┘
```

**B. Payment Processing**

```
Successful Payment:
┌────────────────────────────────┐
│ ✓ Payment Successful!          │
│                                │
│ Transaction ID: TXN-12345      │
│ Amount: IDR 448,800            │
│ Timestamp: 2026-07-07 14:30    │
│                                │
│ Contract Status: ACTIVE        │
│ 🟢 Escrow locked               │
│ 🟡 Waiting for freelancer work │
│                                │
│ Receipt will be sent to email  │
│ [Download Receipt PDF]         │
│                                │
│ [View Contract] [Go to Chat]   │
└────────────────────────────────┘

Failed Payment:
┌────────────────────────────────┐
│ ✗ Payment Failed               │
│                                │
│ Reason: Card declined          │
│ Error code: insufficient_funds │
│                                │
│ Please try:                    │
│ • Different payment method     │
│ • Check card has sufficient    │
│   balance                      │
│ • Contact your bank            │
│                                │
│ [Retry] [Change Method] [Help] │
└────────────────────────────────┘
```

---

### 3.4 Freelancer Profile & Dashboard

**A. Public Profile (when browsed)**

```
┌──────────────────────────────────┐
│ [← Back] [❤️ Save] [📧 Message] [⋮]
├──────────────────────────────────┤
│                                  │
│ [Cover image (optional)]         │
│                    [Avatar]      │
│                   Alex D.        │
│         🌟 4.8 (234 reviews)     │
│         ✓ Verified · Online now  │
│         💚 Jakarta, Indonesia    │
│                                  │
│ Senior Graphic Designer          │
│ "I create stunning designs that  │
│  tell your brand's story."       │
│                                  │
├──────────────────────────────────┤
│ Quick Stats                      │
│ [5 years exp] [98% hired] [12 active] │
│                                  │
├──────────────────────────────────┤
│ Top Skills                       │
│ [Graphic Design] [Figma]         │
│ [Brand Strategy] [UI Design]     │
│                                  │
├──────────────────────────────────┤
│ Portfolio (6 projects)           │
│ [Image 1] [Image 2] [Image 3]    │
│ [Image 4] [Image 5] [Image 6]    │
│ [View All →]                     │
│                                  │
├──────────────────────────────────┤
│ Reviews (showing 3 of 234)       │
│ ⭐⭐⭐⭐⭐ (5/5)               │
│ "Excellent work! Delivered early"│
│ - Client A, 2 weeks ago          │
│                                  │
│ ⭐⭐⭐⭐⭐ (5/5)               │
│ "Professional and responsive"    │
│ - Client B, 1 month ago          │
│                                  │
│ [View All Reviews →]             │
│                                  │
├──────────────────────────────────┤
│ [Message] [Hire This Freelancer] │
│                                  │
└──────────────────────────────────┘
```

**B. Dashboard (Freelancer)**

```
┌──────────────────────────────────────┐
│ Dashboard        [Notifications] [👤]│
│ [My Profile] [Stats] [Settings]      │
├──────────────────────────────────────┤
│                                      │
│ Welcome back, Alex! 🎉               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                      │
│ Key Metrics (Week)                   │
│ [Views: 42] [Messages: 8]            │
│ [Bids: 3] [Hired: 1]                 │
│ [Earnings: IDR 2,400,000]            │
│                                      │
├──────────────────────────────────────┤
│ Active Bids (3/30 PRO quota)         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                      │
│ [Logo Design]                        │
│ Bid: IDR 400,000 · Posted 2h ago     │
│ 🟡 Awaiting Client Review            │
│ [View] [Withdraw]                    │
│                                      │
│ [Website Redesign]                   │
│ Bid: IDR 1,500,000 · Posted 4h ago   │
│ 🟡 Awaiting Client Review            │
│ [View] [Withdraw]                    │
│                                      │
├──────────────────────────────────────┤
│ Active Contracts (2/10 quota)        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                      │
│ [Branding Package]                   │
│ Status: 🟢 IN_PROGRESS (Day 3/7)    │
│ Client: John S. · ⭐4.8              │
│ [View] [Upload Work]                 │
│                                      │
│ [Blog Articles]                      │
│ Status: 🟡 IN_REVIEW (Day 2/5)      │
│ Client: Maria T. · ⭐5.0             │
│ [View] [Message Client]              │
│                                      │
├──────────────────────────────────────┤
│ Wallet & Payouts                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Available: IDR 4,500,000             │
│ On Hold: IDR 1,200,000 (release in 5d)
│ [Request Payout] [Transaction History]│
│                                      │
├──────────────────────────────────────┤
│ Recommendations For You (Matching)   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ 85% Match: Logo Design Refresh       │
│ Budget: IDR 300k · Design · Remote   │
│ Reasons: 3 skill match, same city    │
│ [View] [Bid Now] [Save]              │
│                                      │
│ 92% Match: Pitch Deck Design         │
│ Budget: IDR 1.5M · Design · Remote   │
│ [View] [Bid Now]                     │
│                                      │
└──────────────────────────────────────┘
```

---

### 3.5 Subscription Upgrade Flow

**A. Current Limits Alert**

```
┌──────────────────────────────────┐
│ ⚠️ Bid Limit Reached             │
├──────────────────────────────────┤
│ You've reached your FREE plan    │
│ limit of 5 active bids.          │
│                                  │
│ Current Plan: FREE               │
│ • 5 active bids                  │
│ • 2 active contracts             │
│ • Standard support               │
│                                  │
│ Upgrade to PRO for:              │
│ • 30 active bids                 │
│ • 10 active contracts            │
│ • Priority support               │
│ • Custom profile URL             │
│ • Analytics                      │
│ • Only IDR 160,000/month         │
│                                  │
│ [Upgrade Now] [Learn More]       │
└──────────────────────────────────┘
```

**B. Upgrade Modal**

```
┌────────────────────────────────────┐
│ Upgrade Subscription    [✕]        │
├────────────────────────────────────┤
│                                    │
│ Select a plan:                     │
│                                    │
│ [FREE (Current)]    [PRO] [AGENCY] │
│                                    │
│ PRO - IDR 160,000/month            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ ✓ 30 active bids (vs 5)            │
│ ✓ 10 active contracts (vs 2)       │
│ ✓ Priority support                 │
│ ✓ Custom profile URL               │
│ ✓ Basic analytics                  │
│ ✓ Monthly/Annual billing           │
│                                    │
│ Billing Cycle                      │
│ ○ Monthly (IDR 160,000)            │
│ ○ Annual (IDR 1,600,000 - save 17%)│
│                                    │
│ Payment Method                     │
│ [Select] ▼                         │
│                                    │
│ [Debit Card]                       │
│ [Cancel] [Pay & Upgrade]           │
│                                    │
└────────────────────────────────────┘
```

---

### 3.6 Moderation & Appeal Flow

**A. Suspension Notification (Email + In-App)**

```
┌────────────────────────────────────┐
│ ⚠️ Account Temporarily Suspended   │
├────────────────────────────────────┤
│                                    │
│ Your account has been temporarily │
│ suspended due to violation of our  │
│ Terms of Service.                  │
│                                    │
│ Violation: Multiple late deliveries│
│ Suspension Level: Soft Suspend (7d)│
│ Expires: 2026-07-14                │
│                                    │
│ What this means:                   │
│ • Cannot place new bids            │
│ • Profile is hidden from search    │
│ • Existing contracts remain active │
│                                    │
│ You have 7 days to appeal this     │
│ decision. Review our ToS here ▶    │
│                                    │
│ [Appeal Suspension] [Learn More]   │
│                                    │
└────────────────────────────────────┘
```

**B. Appeal Submission Modal**

```
┌────────────────────────────────────┐
│ Appeal Suspension       [✕]        │
├────────────────────────────────────┤
│                                    │
│ Original Reason:                   │
│ "Multiple late deliveries"         │
│                                    │
│ Explain why you think this is a    │
│ mistake or provide evidence: *     │
│                                    │
│ [Text area: "I had internet issues│
│ but delivered the next day with   │
│ excellent quality. All clients gave│
│ positive reviews. I apologize..."] │
│                                    │
│ Upload supporting evidence:        │
│ [Chat screenshots] [Client reviews]│
│ [+ Add files]                      │
│                                    │
│ Our team will review within 5      │
│ business days.                     │
│                                    │
│ [Cancel] [Submit Appeal]           │
│                                    │
└────────────────────────────────────┘
```

**C. Appeal Decision Notification**

```
✓ Appeal Approved!

Your suspension has been removed.
Your account is now fully active.

We appreciate your patience and
look forward to working with you.

[Return to Dashboard]
```

---

## 4. Comparison with Competitor UX

### 4.1 Fastwork (Indonesia Local UX)
**What NearWork should adopt:**
- ✅ Simple category browsing (no complex filters initially)
- ✅ Fast checkout (Midtrans integration feels native)
- ✅ Job card shows **response time** (builds trust)
- ✅ Clear budget display (no hidden fees)
- ✅ Mobile-first (Fastwork dominates on mobile)

**Gap to Fix:**
- ❌ V1 NearWork has cluttered dashboard
- ❌ Payment options too limited (add Midtrans VA, e-wallet)
- ❌ Trust signals weak (add response time, verified badge visibility)

### 4.2 Upwork (Trust & Professionalism)
**What NearWork should adopt:**
- ✅ Escrow system (transparent, builds confidence)
- ✅ Comprehensive freelancer profiles (portfolio, reviews, earnings)
- ✅ Dispute resolution process (fair, documented)
- ✅ Earnings dashboard (track, understand commission)
- ✅ Connection between messaging & job (context-aware)

**Gap to Fix:**
- ❌ V1 lacks escrow UI (added in V2)
- ❌ Dispute/appeal flow not visible (added in V2)
- ❌ Commission breakdown unclear (add transparent fee display)

### 4.3 Fiverr (Simplicity & Gig Economy)
**What NearWork should adopt:**
- ✅ Package pricing (tiered options: Basic, Standard, Premium)
- ✅ Fast bid/purchase flow (3 clicks max)
- ✅ Clear delivery timeline (calendar, countdown)
- ✅ Personality in profiles (videos, testimonials)
- ✅ "Why choose me" clear value prop

**Gap to Fix:**
- ❌ V1 job posting too complex (simplify to 5 steps)
- ❌ Bid submission not prominent enough (make CTA bigger)
- ❌ Freelancer personality not showcased (add short intro video)

---

## 5. Mobile-First Responsive Design

### 5.1 Breakpoints

```
Mobile:     320px - 767px   (focus: simplicity, touch)
Tablet:     768px - 1024px  (focus: multi-column, efficiency)
Desktop:    1025px+         (focus: density, power user)
```

**Responsive Patterns:**

**Search Results:**
```
Mobile:    1-column (full width card, stack vertically)
Tablet:    2-column (side-by-side)
Desktop:   3-column + sidebar (filters on left)
```

**Dashboard:**
```
Mobile:    Stacked cards (vertical), drawer for navigation
Tablet:    2-column (stats + content)
Desktop:   4-column grid (stats, bids, contracts, messages)
```

**Tables:**
```
Mobile:    Hidden columns, swipe to reveal
Tablet:    All columns visible, horizontal scroll on demand
Desktop:   Full table, sticky header, sorting
```

### 5.2 Touch Target Sizes

```
Minimum:    44px × 44px (buttons, links)
Comfortable: 48px × 48px (form inputs)
Dense:      32px × 32px (secondary actions like delete)

Spacing:    Minimum 8px between touch targets (avoid accidental taps)
```

**Example Button Sizes:**
- Primary CTA: 48px height, full-width on mobile
- Secondary: 40px height
- Tertiary/text: 32px height (but clickable area 44px via padding)

### 5.3 Mobile Layout Grid

```
┌────────────────────┐
│  Header (60px)     │ ← sticky
├────────────────────┤
│                    │
│  Safe Area (24px   │
│   side padding)    │
│                    │
├────────────────────┤
│ Bottom Nav (60px)  │ ← sticky
│ [Home] [Jobs]      │
│ [Messages] [Profile]
└────────────────────┘
```

---

## 6. Key UX Improvements Over V1

### 6.1 Critical Issues Fixed

| Issue (V1) | Solution (V2) | Impact |
|-----------|--------------|--------|
| Confusing job posting | 6-step wizard, clear section titles | ↑ 30% job post completion |
| No payment UI | Stripe + Midtrans full flow | ↑ 60% payment success |
| Weak trust signals | Badges, response time, verification | ↑ 25% bid acceptance |
| Mobile usability poor | Responsive redesign, 44px buttons | ↑ 40% mobile conversion |
| Unclear pricing | Transparent fee breakdown, no surprises | ↑ 15% buyer confidence |
| Scattered notifications | Unified notification center + email | ↑ engagement |
| No recommendations | AI-powered job suggestions | ↑ 20% bid submissions |

### 6.2 Micro-Interactions & Delight

**Loading States:**
- Skeleton screens (not spinners) for cards
- Progressive content reveal
- Optimistic UI updates (instant feedback)

**Transitions:**
- Smooth page transitions (300ms fade)
- Modal slide-up (250ms)
- List item hover: subtle background color shift

**Validation:**
- Real-time field validation (green checkmark)
- Clear error messages (not red X, but hint text)
- Inline validation: "Email format correct ✓"

**Notifications:**
- Toast (non-blocking): payment success, bid submitted
- Alert (dismissible): insufficient balance, quota warnings
- Modal (blocking): critical actions, confirmations

---

## 7. Accessibility (WCAG 2.1 AA)

### 7.1 Checklist

- [ ] **Color Contrast:** All text ≥7:1 (AAA), UI controls ≥4.5:1 (AA)
- [ ] **Keyboard Navigation:** Tab order logical, focus visible (focus-ring: 2px outline)
- [ ] **ARIA Labels:** Buttons, icons, form fields have semantic labels
- [ ] **Alternative Text:** All images have alt text (not "image123.jpg")
- [ ] **Form Labels:** Every input has associated `<label>`
- [ ] **Error Messages:** Clear, actionable (not just red text)
- [ ] **Motion:** Respect `prefers-reduced-motion` media query
- [ ] **Screen Reader:** Use headings, semantic HTML, skip links
- [ ] **Zoom:** Supports 200% zoom without loss of functionality
- [ ] **Mobile:** Accessible without pinch-zoom (viewport set correctly)

**Example: Accessible Button**
```tsx
<button
  aria-label="Save job to favorites"
  className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
  onClick={handleSave}
>
  <Heart size={24} aria-hidden="true" />
</button>
```

---

## 8. Performance & Core Web Vitals

### 8.1 Targets

| Metric | Target | Tool |
|--------|--------|------|
| **LCP** (Largest Contentful Paint) | <2.5s | Lighthouse |
| **FID** (First Input Delay) | <100ms | Web Vitals |
| **CLS** (Cumulative Layout Shift) | <0.1 | Lighthouse |
| **TTFB** (Time to First Byte) | <600ms | PageSpeed |
| **FCP** (First Contentful Paint) | <1.8s | Lighthouse |

### 8.2 Optimization Tactics

**Images:**
- Use Next.js `Image` component (auto-optimization, lazy loading)
- WebP format with fallback
- Responsive images: srcset for mobile/tablet/desktop
- Placeholders: blur-up effect while loading

**JavaScript:**
- Code splitting (route-based, component-based)
- Lazy load modals, heavy components
- Tree-shake unused code (Tailwind JIT)

**Caching:**
- Service Worker (PWA) for offline support
- HTTP cache headers (1 week for static assets)
- Redis cache for subscription plans (TTL 1hr)

**Rendering:**
- SSR for landing page (SEO, initial paint speed)
- Static export for help pages
- React Suspense for data fetching

---

## 9. Design System Implementation (Tailwind + shadcn/ui)

### 9.1 Component Examples

**TrustBadge Component:**
```tsx
export const TrustBadge = ({ 
  rating, 
  reviewCount, 
  verified = false 
}) => (
  <div className="flex items-center gap-2">
    {verified && (
      <span className="flex items-center gap-1">
        <CheckCircle2 size={16} className="text-green-500" />
        <span className="text-xs text-gray-600">Verified</span>
      </span>
    )}
    {rating && (
      <span className="flex items-center gap-1">
        <Star size={16} className="fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
        <span className="text-xs text-gray-600">({reviewCount})</span>
      </span>
    )}
  </div>
);
```

**PriceDisplay Component:**
```tsx
export const PriceDisplay = ({ 
  amount, 
  currency = 'IDR', 
  showFeeBreakdown = false 
}) => {
  const escrowFee = Math.ceil(amount * 0.02);
  const tax = Math.ceil(amount * 0.10);
  const total = amount + escrowFee + tax;

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600">Bid Amount</span>
        <span className="font-semibold">
          {formatCurrency(amount, currency)}
        </span>
      </div>
      {showFeeBreakdown && (
        <>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Escrow Fee (2%)</span>
            <span>{formatCurrency(escrowFee, currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tax (10%)</span>
            <span>{formatCurrency(tax, currency)}</span>
          </div>
          <div className="h-px bg-gray-200 my-2" />
        </>
      )}
      <div className="flex justify-between font-bold">
        <span>Total</span>
        <span className="text-blue-600">{formatCurrency(total, currency)}</span>
      </div>
    </div>
  );
};
```

**EscrowStatus Component:**
```tsx
export const EscrowStatus = ({ 
  contractId, 
  status, 
  timeline 
}) => {
  const stages = ['Locked', 'In Review', 'Approved', 'Released'];
  const currentIdx = stages.indexOf(status);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {stages.map((stage, idx) => (
          <div key={stage} className="flex-1 flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                idx <= currentIdx
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {idx < currentIdx ? '✓' : idx + 1}
            </div>
            <span className="text-xs text-gray-600 mt-1">{stage}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600 text-center">
        {timeline ? `Releases in ${timeline}` : 'Waiting for approval'}
      </p>
    </div>
  );
};
```

---

## 10. Implementation Roadmap

### Phase 1: Design System & Components (Week 1-2)
- [ ] Finalize color palette, typography, spacing
- [ ] Create Tailwind config (custom colors, extend theme)
- [ ] Build 20 core components (Button, Card, Input, etc.)
- [ ] Storybook setup for component library
- [ ] Design tokens in Figma (single source of truth)

### Phase 2: Landing Page & Navigation (Week 2-3)
- [ ] Homepage redesign (hero, categories, social proof)
- [ ] Responsive header/nav (mobile hamburger, desktop menu)
- [ ] Help & pricing pages
- [ ] SEO optimization (meta tags, structured data)

### Phase 3: Job & Search Flow (Week 3-4)
- [ ] Job posting wizard (6 steps, progress indicator)
- [ ] Job search & filters (mobile-optimized, faceted)
- [ ] Job detail page (full specs, client info, CTA)
- [ ] Bid submission modal (cover letter, timeline, attachments)

### Phase 4: Payment & Checkout (Week 4-5)
- [ ] Payment method selector (Stripe, Midtrans)
- [ ] Card form (Stripe Elements integration)
- [ ] Snap iframe (Midtrans integration)
- [ ] Payment confirmation & receipt
- [ ] Invoice PDF generation

### Phase 5: Dashboard & Profiles (Week 5-6)
- [ ] Freelancer dashboard (stats, bids, contracts, wallet)
- [ ] Client dashboard (posted jobs, bids received, contracts)
- [ ] Public profile pages (freelancer & client)
- [ ] Recommendation widget & email digest

### Phase 6: Admin & Moderation (Week 6-7)
- [ ] Admin moderation queue (report list, detail, resolution)
- [ ] Analytics dashboard (GMV, users, SLA, disputes)
- [ ] Suspension & appeal flows
- [ ] Feature flags & A/B testing UI

### Phase 7: Polish & QA (Week 7-8)
- [ ] Mobile testing (iOS & Android browsers)
- [ ] Accessibility audit (WAVE, axe DevTools)
- [ ] Performance optimization (Lighthouse 90+)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] User testing with freelancers & clients

---

## 11. Design Deliverables Checklist

- [ ] **Figma Design System** (shared with team)
  - Color library (semantic & raw)
  - Typography styles
  - Component library (40+ components)
  - Design tokens exported to JSON

- [ ] **Storybook** (component documentation)
  - All components with variants
  - Accessibility notes
  - Usage examples
  - Code snippets

- [ ] **Component Library** (npm package)
  - `@nearwork/ui` package
  - TypeScript types
  - Tailwind classes baked in
  - Dark mode variants

- [ ] **Wireframes & Flows**
  - All key user flows (20+ screens)
  - Mobile & desktop variants
  - Interaction notes (hover, focus, active)

- [ ] **Design Specs** (this document)
  - Design tokens
  - Component specs
  - Responsive breakpoints
  - Accessibility guidelines

- [ ] **Handoff Documentation**
  - Figma links for each feature
  - CSS Tailwind classes
  - Component prop names
  - Edge cases & states

---

## 12. Quality Assurance & Testing

### 12.1 Visual Regression Testing
```bash
# Chromatic (automated visual regression)
pnpm test:visual  # Compares current screenshots with baseline

# Manual testing: Device Lab
# - iPhone SE (small), iPhone 12 Pro, iPhone 14 Pro Max
# - Samsung Galaxy S10 (small), S20 (medium), S22 Ultra (large)
# - iPad (tablet)
```

### 12.2 Accessibility Testing
```bash
# WAVE (browser extension)
# Run on every page: home, jobs, freelancers, dashboard, checkout

# axe DevTools (automated)
pnpm test:a11y  # Headless accessibility tests

# Screen reader testing
# - NVDA (Windows)
# - JAWS (Windows, paid)
# - VoiceOver (Mac/iOS)
```

### 12.3 Performance Testing
```bash
pnpm build:analyze    # Bundle size analysis
lighthouse           # CWV audit (LCP, FID, CLS)
pnpm test:perf       # Synthetic performance tests
```

---

## Appendix: Design File Locations

**Figma Master File:**
```
https://figma.com/file/NEARWORK-V2-DESIGN-SYSTEM
├─ Design System (colors, typography, spacing)
├─ Components (40+ components with variants)
├─ Landing Page (hero, sections)
├─ Job Flows (post, search, bid, payment)
├─ Dashboard (freelancer, client, admin)
├─ Mobile Views (all key screens)
└─ Specifications (handoff, annotations)
```

**Component Storybook:**
```
https://storybook.nearwork.dev/
├─ Buttons
├─ Forms
├─ Cards
├─ Modals
├─ Navigation
└─ Custom (TrustBadge, PriceDisplay, EscrowStatus, etc.)
```

---

**End of UI/UX Design Document**  
Document prepared by: Dozer (CEO & Lead Engineer) + Design Lead  
Next review: 2026-08-15  
Status: Ready for Handoff to Frontend Team
