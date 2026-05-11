-- DropIndex
DROP INDEX "ledgers_name_key";

-- AlterTable
ALTER TABLE "holdings" ADD COLUMN     "nextMaintenanceDue" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'UNINSTALLED';
