/*
  Warnings:

  - The values [FREE] on the enum `Plans` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Plans_new" AS ENUM ('BASE', 'PRO', 'ENTERPRISE');
ALTER TABLE "public"."Subscription" ALTER COLUMN "subscriptionType" TYPE "public"."Plans_new" USING ("subscriptionType"::text::"public"."Plans_new");
ALTER TYPE "public"."Plans" RENAME TO "Plans_old";
ALTER TYPE "public"."Plans_new" RENAME TO "Plans";
DROP TYPE "public"."Plans_old";
COMMIT;

-- AlterEnum
ALTER TYPE "public"."SubscriptionStatus" ADD VALUE 'TRIAL';

-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "subscriptionCycleId" TEXT;

-- CreateTable
CREATE TABLE "public"."PackageRecord" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "isTrial" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionCycleId" TEXT NOT NULL,
    "workers" INTEGER NOT NULL DEFAULT 0,
    "projects" INTEGER NOT NULL DEFAULT 0,
    "tasks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageRecord_pkey" PRIMARY KEY ("id")
);
