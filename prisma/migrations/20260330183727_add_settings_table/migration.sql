/*
  Warnings:

  - You are about to drop the column `freeInstallationDays` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `totalInstallations` on the `bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "freeInstallationDays",
DROP COLUMN "totalInstallations",
ADD COLUMN     "freeMountings" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalMountings" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "company_settings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT 'Supreme Media Advertising',
    "tagline" TEXT DEFAULT 'Creative • Innovative • Positive',
    "gstNo" TEXT,
    "panNo" TEXT,
    "address" TEXT,
    "bankName" TEXT,
    "accountName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "micrCode" TEXT,
    "branchCode" TEXT,
    "bankAddress" TEXT,
    "terms" TEXT[],
    "signatoryName" TEXT DEFAULT 'Company Signator Name',
    "signatureUrl" TEXT,
    "footerAddress" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);
