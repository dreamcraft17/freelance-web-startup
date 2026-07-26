# NearWork — Security

> **Doc revision:** v1  
> Last synchronized: 2026-07-26  
> Detail audit: [`../SECURITY_AUDIT_2026-07-08.md`](../SECURITY_AUDIT_2026-07-08.md) · living risk: [`../audit.md`](../audit.md)

## Fondasi yang sudah baik

| Kontrol | Implementasi |
|---------|----------------|
| Password | bcrypt cost 12 |
| Session | JWT HS256 di cookie `acme_session`, HttpOnly, SameSite=Lax, Secure di production |
| CSRF | Double-submit cookie + `X-CSRF-Token` pada mutasi |
| Authz | Policy layer + `protectStaff` + middleware `/admin` |
| Validation | Zod pada mayoritas input API |
| Headers | X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options; HSTS opt-in |
| Discovery | Rate limit + fingerprint / UA heuristics pada search publik |
| XSS surface | Tidak ada `dangerouslySetInnerHTML` / `eval` pada audit statis |

Production boot: `instrumentation.ts` menolak `SESSION_SECRET` lemah.

---

## Temuan terbuka (prioritas)

### Critical / High — selesaikan sebelum PSP production

1. **Midtrans webhook** — jika `signature_key` absen, settlement masih bisa diproses. Wajib **reject** tanpa signature valid.
2. **Stripe webhook** — verifikasi bukan HMAC Stripe standar (`t.v1`). Perbaiki ke Stripe-signed payload verification.
3. **Seed defaults** — `admin@nearwork.local` / password seed & E2E fixtures **jangan** pernah ke production.

### Medium

4. Rate limit **in-memory** — tidak shared antar instance serverless; bisa diloloskan di scale-out.
5. **Tidak ada CSP** belum.
6. `POST /api/donations` — kontrol abuse lemah (MOCK inserts).
7. Trust proxy IP headers — hati-hati spoofing di belakang CDN.

### Hygiene

8. Jangan taruh file `*credentials*.csv` / recovery codes di `apps/web/public` (gitignore ada; tetap audit deploy FS).

---

## RBAC ringkas

- Marketplace: `CLIENT` create jobs; `FREELANCER` bid; owner-only shortlist/accept.
- Staff: `ADMIN`, `SUPPORT_ADMIN`, `MODERATOR`, `FINANCE_ADMIN` — matrix halaman di `features/admin/lib/access.ts`.
- Account inactive → `/forbidden`.

Detail: [roles-and-permissions.md](./roles-and-permissions.md).

---

## Data / privacy notes

- Session & locale cookies bukan secret bisnis, tapi jangan cache HTML sensitif lintas-locale tanpa `Vary`.
- `GOOGLE_TRANSLATE_API_KEY` server-only.
- Escrow & wallet menyimpan data keuangan — hardening PSP + akses FINANCE_ADMIN wajib sebelum GA berbayar.
- Patuhi UU PDP untuk data pribadi profil & laporan moderasi (proses retention masih product decision).

---

## Checklist sebelum go-live berbayar

- [ ] Fix Stripe + Midtrans webhook verification (tes dengan payload palsu harus 401/400)
- [ ] Rotate semua secrets; non-default `SESSION_SECRET`
- [ ] Tidak ada seed admin default
- [ ] Worker terisolasi + monitoring
- [ ] HSTS on; rencanakan CSP
- [ ] Rate limit store terpusat (Redis) atau edge WAF
- [ ] Peninjauan `/api/donations` & public write surfaces
- [ ] Incident contact + log retention (internal)

Customer-facing ringkas bisa ditautkan dari `/privacy` & `/terms`.
