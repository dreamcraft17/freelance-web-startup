ALTER TABLE "PaymentIntent" ADD COLUMN "dokuInvoiceNumber" VARCHAR(64);

CREATE UNIQUE INDEX "PaymentIntent_dokuInvoiceNumber_key" ON "PaymentIntent"("dokuInvoiceNumber");
