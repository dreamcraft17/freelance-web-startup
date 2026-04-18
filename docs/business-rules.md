# Business Rules

> **Doc revision:** v1  
> Last synchronized: 2026-04-18 (post-accept handoff update applied across product and docs).

- Active bid statuses count for quota: `SUBMITTED`, `SHORTLISTED`, `ACCEPTED`.
- Active contract statuses count for quota: `ACTIVE`, `IN_PROGRESS`.
- Free freelancer limit: `maxActiveBids=5`, `maxActiveAcceptedContracts=2`.
- Pro freelancer limit: `maxActiveBids=30`, `maxActiveAcceptedContracts=10`.
- Bid submission requires:
  - active account
  - completed freelancer profile
  - open job + valid deadline
  - unique bid per freelancer per job
  - work mode compatibility

## Update status (April 2026)

- Decision flow client diperjelas di UI:
  - jobs yang perlu perhatian ditandai (pending/shortlisted signal),
  - bid comparison menampilkan sinyal keputusan inti (harga, profil, lokasi/mode, status),
  - next action (`Accept bid`) tersedia langsung pada context review.
- Rule domain utama tetap tidak berubah; pembaruan fokus pada clarity dan operasionalisasi workflow.
