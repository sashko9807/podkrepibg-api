/*
  Warnings:

  - A unique constraint covering the columns `[payment_reference]` on the table `donations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "payment_reference" VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX "donations_payment_reference_key" ON "donations"("payment_reference");
