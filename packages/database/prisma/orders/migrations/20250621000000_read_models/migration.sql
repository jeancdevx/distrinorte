-- CreateTable
CREATE TABLE "customer_snapshots" (
    "customer_id" TEXT NOT NULL,
    "tax_id" TEXT NOT NULL,
    "assigned_warehouse_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_snapshots_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "price_snapshots" (
    "sku" TEXT NOT NULL,
    "unit_price_net" DECIMAL(12,2) NOT NULL,
    "sale_unit" TEXT NOT NULL DEFAULT 'UN',
    "units_per_base_unit" INTEGER NOT NULL DEFAULT 1,
    "tax_affectation" TEXT NOT NULL DEFAULT 'GRAVADO',
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_snapshots_pkey" PRIMARY KEY ("sku")
);
