-- Default for new Job rows: IDR (Indonesia-first marketplace). Legacy rows keep stored currency.
ALTER TABLE "Job" ALTER COLUMN "currency" SET DEFAULT 'IDR';
