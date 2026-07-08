-- F13: stock transfers and reservation status
CREATE TYPE "ReservationStatus" AS ENUM ('CONFIRMED', 'PENDING_TRANSFER');
CREATE TYPE "StockTransferStatus" AS ENUM ('ALLOCATED', 'IN_TRANSIT', 'COMPLETED', 'FAILED');

ALTER TABLE "reservations"
  ADD COLUMN IF NOT EXISTS "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED';

CREATE TABLE IF NOT EXISTS "stock_transfers" (
  "id" TEXT NOT NULL,
  "order_id" TEXT NOT NULL,
  "destination_warehouse_id" TEXT NOT NULL,
  "status" "StockTransferStatus" NOT NULL DEFAULT 'ALLOCATED',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  CONSTRAINT "stock_transfers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "stock_transfers_order_id_idx" ON "stock_transfers"("order_id");

CREATE TABLE IF NOT EXISTS "stock_transfer_lines" (
  "id" TEXT NOT NULL,
  "transfer_id" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "from_warehouse_id" TEXT NOT NULL,
  "quantity_base" INTEGER NOT NULL,
  CONSTRAINT "stock_transfer_lines_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "stock_transfer_lines"
  ADD CONSTRAINT "stock_transfer_lines_transfer_id_fkey"
  FOREIGN KEY ("transfer_id") REFERENCES "stock_transfers"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
