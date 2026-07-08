-- F12: commercial amounts, outbox, extended order status
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'AWAITING_TRANSFER';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "total_net" DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS "total_tax" DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS "total_gross" DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS "estimated_delivery_date" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "invoice_id" TEXT,
  ADD COLUMN IF NOT EXISTS "pdf_url" TEXT;

ALTER TABLE "order_lines"
  ADD COLUMN IF NOT EXISTS "unit_price_net" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "sale_unit" TEXT NOT NULL DEFAULT 'UN',
  ADD COLUMN IF NOT EXISTS "units_per_base_unit" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "tax_affectation" TEXT NOT NULL DEFAULT 'GRAVADO',
  ADD COLUMN IF NOT EXISTS "line_net" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "line_tax" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "line_gross" DECIMAL(12, 2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "outbox_events" (
  "id" TEXT NOT NULL,
  "aggregate_type" TEXT NOT NULL,
  "aggregate_id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "published_at" TIMESTAMP(3),
  CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "outbox_events_published_at_created_at_idx"
  ON "outbox_events"("published_at", "created_at");
