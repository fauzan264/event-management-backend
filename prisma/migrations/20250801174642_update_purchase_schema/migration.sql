/*
  Warnings:

  - Added the required column `expired_at` to the `purchase_orders` table without a default value. This is not possible if the table is not empty.
  - Made the column `event_id` on table `purchase_orders` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_event_id_fkey";

-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN     "expired_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "event_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
