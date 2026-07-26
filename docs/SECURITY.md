# NextWork — Security

> **Doc revision:** v3  
> Last synchronized: 2026-07-26 (current-scope DoD + payment harden)  
> Detail audit historis: [`../SECURITY_AUDIT_2026-07-08.md`](../SECURITY_AUDIT_2026-07-08.md) · living risk: [`../audit.md`](../audit.md) · ops: [PAYMENT-RUNBOOK.md](./PAYMENT-RUNBOOK.md)

## Fondasi yang sudah baik

| Kontrol | Implementasi |
|---------|----------------|
| Password | bcrypt cost 12 |
| Session | JWT HS256 di cookie `acme_session`, HttpOnly, SameSite=Lax, Secure di production; `POST /api/auth/refresh` re-issue 7d |
| CSRF | Double-submit cookie + `X-CSRF-Token` pada mutasi |
| Authz | Policy layer + `protectStaff` + middleware `/admin` |
| Validation | Zod pada mayoritas input API |
| Headers | X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options; HSTS opt-in `NEXTWORK_ENABLE_HSTS` |
| Discovery | Rate limit + fingerprint / UA heuristics pada search publik |
| **Stripe webhook** | HMAC-SHA256(`t.payload`) + timestamp tolerance + amount/currency check |
| **Midtrans notification** | SHA512 signature wajib + gross_amount vs intent |
| Webhook abuse | IP rate limit on PSP webhook routes |
| Escrow complete | Locked/disputed escrow cannot use generic `/complete` |
| Paid gates | Boost/sub activate only after SUCCEEDED (mock non-prod only) |
| Payouts | Admin approve → PROCESSING → worker SENT (no auto-SENT from PENDING) |
| XSS surface | Tidak ada `dangerouslySetInnerHTML` / `eval` pada audit statis |

Production boot: `instrumentation.ts` menolak `SESSION_SECRET` lemah **dan** missing `NEXT_PUBLIC_APP_URL`.

---

## Temuan residual

### Resolved in current-scope / v2.1 (kode)

1. ~~Midtrans webhook tanpa signature masih proses settlement~~ → **reject 400**
2. ~~Stripe verify memakai `createHash` salah~~ → **HMAC-SHA256**
3. ~~Escrow complete bypass / worker holdback skip~~ → **policy + money-jobs**
4. ~~Boost/sub tanpa bayar~~ → **paid gates**
5. ~~Checkout UI set success lokal~~ → **Stripe.js / Snap / mock simulate**

### Masih terbuka (Conditional / ops)

3. **Seed defaults** — `admin@nextwork.local` / password seed & E2E fixtures **jangan** pernah ke production.
4. Rate limit **in-memory** — tidak shared antar instance serverless (Redis = follow-up).
5. **Tidak ada CSP** penuh belum.
6. `POST /api/donations` — kontrol abuse lemah (MOCK inserts).
7. Trust proxy IP headers — hati-hati spoofing di belakang CDN.
8. **LIVE PSP keys + legal + pilot txs** — [PAYMENT-RUNBOOK.md](./PAYMENT-RUNBOOK.md).

---

## RBAC ringkas

- Marketplace: `CLIENT` create jobs; `FREELANCER` bid; owner-only shortlist/accept.
- Staff: `ADMIN`, `SUPPORT_ADMIN`, `MODERATOR`, `FINANCE_ADMIN` — matrix halaman di `features/admin/lib/access.ts`.
- Account inactive → `/forbidden`.

Detail: [roles-and-permissions.md](./roles-and-permissions.md).

---

## Checklist sebelum go-live berbayar

- [x] Fix Stripe + Midtrans webhook verification (unit + negatif curl) — lihat [PAYMENT-RUNBOOK.md](./PAYMENT-RUNBOOK.md)
- [ ] Rotate semua secrets; non-default `SESSION_SECRET`
- [ ] Tidak ada seed admin default di production
- [ ] Worker terisolasi + monitoring
- [ ] HSTS on (`NEXTWORK_ENABLE_HSTS=1`); rencanakan CSP
- [ ] Rate limit store terpusat (Redis) atau edge WAF
- [ ] Peninjauan `/api/donations` & public write surfaces
- [ ] Incident contact + log retention (internal)
- [ ] 3 pilot transaksi staging + ToS payment T&Cs

Customer-facing ringkas: `/privacy` & `/terms`.
