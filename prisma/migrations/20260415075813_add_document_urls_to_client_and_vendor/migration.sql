-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "agreementDocumentUrl" TEXT,
ADD COLUMN     "kycDocumentUrl" TEXT;

-- AlterTable
ALTER TABLE "holdings" ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "agreementDocumentUrl" TEXT,
ADD COLUMN     "kycDocumentUrl" TEXT;
