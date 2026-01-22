-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('NEW_ITEM', 'VINTAGE_AND_SOURCED');

-- CreateTable
CREATE TABLE "adminProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "sku" TEXT NOT NULL,
    "material" TEXT,
    "location" TEXT,
    "condition" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "price" DOUBLE PRECISION NOT NULL,
    "specialPrice" DOUBLE PRECISION,
    "specialPriceFrom" TIMESTAMP(3),
    "specialPriceTo" TIMESTAMP(3),
    "stockQuantity" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "length" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "description" TEXT,
    "sourcingStory" TEXT,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adminProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "adminProduct_sku_key" ON "adminProduct"("sku");
