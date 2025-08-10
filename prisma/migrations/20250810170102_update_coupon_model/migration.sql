-- AlterTable
ALTER TABLE "coupon" ADD COLUMN     "eventId" VARCHAR(36);

-- AddForeignKey
ALTER TABLE "coupon" ADD CONSTRAINT "coupon_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
