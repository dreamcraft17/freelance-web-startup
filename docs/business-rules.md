# Business Rules

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
