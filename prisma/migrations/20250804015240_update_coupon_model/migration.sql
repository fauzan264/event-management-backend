-- DropForeignKey
ALTER TABLE "coupon" DROP CONSTRAINT "coupon_event_organizer_id_fkey";

-- AlterTable
ALTER TABLE "coupon" ALTER COLUMN "event_organizer_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "coupon" ADD CONSTRAINT "coupon_event_organizer_id_fkey" FOREIGN KEY ("event_organizer_id") REFERENCES "event_organizer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
