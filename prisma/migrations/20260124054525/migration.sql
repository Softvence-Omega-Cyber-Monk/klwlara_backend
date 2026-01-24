/*
  Warnings:

  - You are about to drop the `adminProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('Fresh_Conditions', 'Brand_New', 'Used');

-- CreateEnum
CREATE TYPE "IsAdminApprove" AS ENUM ('approved', 'rejected', 'pending');

-- DropTable
DROP TABLE "adminProduct";

-- CreateTable
CREATE TABLE "AdminProduct" (
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

    CONSTRAINT "AdminProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProducts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "sku" TEXT NOT NULL,
    "material" TEXT,
    "location" TEXT,
    "condition" "Condition" NOT NULL,
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
    "isAdminApprove" "IsAdminApprove" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProducts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminProduct_sku_key" ON "AdminProduct"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "UserProducts_sku_key" ON "UserProducts"("sku");
