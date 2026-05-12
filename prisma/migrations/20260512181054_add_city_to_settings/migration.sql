-- AlterTable
ALTER TABLE "company_settings" ADD COLUMN     "cityId" TEXT;

-- AddForeignKey
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
