-- AlterTable
ALTER TABLE "location_suggestions" ADD COLUMN     "suggestedById" TEXT,
ADD COLUMN     "suggestedByName" TEXT;

-- AlterTable
ALTER TABLE "ownership_contracts" ADD COLUMN     "contractType" TEXT NOT NULL DEFAULT 'ASSET_RENTING';

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "ifsc" TEXT,
ADD COLUMN     "vendorType" TEXT NOT NULL DEFAULT 'LANDLORD';

-- AddForeignKey
ALTER TABLE "location_suggestions" ADD CONSTRAINT "location_suggestions_suggestedById_fkey" FOREIGN KEY ("suggestedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
