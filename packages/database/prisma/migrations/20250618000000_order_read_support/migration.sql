-- AlterTable
ALTER TABLE "orders" ADD COLUMN "rejection_reason" TEXT;

-- CreateIndex
CREATE INDEX "orders_customer_id_created_at_idx" ON "orders"("customer_id", "created_at" DESC);
