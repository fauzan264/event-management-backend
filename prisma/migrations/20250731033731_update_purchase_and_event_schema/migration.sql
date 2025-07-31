/*
  Warnings:

  - You are about to drop the column `venue_id` on the `purchase_orders` table. All the data in the column will be lost.
  - Added the required column `price` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_coupon_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_user_points_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_venue_id_fkey";

-- AlterTable
ALTER TABLE "event" ADD COLUMN     "price" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "purchase_orders" DROP COLUMN "venue_id",
ALTER COLUMN "coupon_id" DROP NOT NULL,
ALTER COLUMN "user_points_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_user_points_id_fkey" FOREIGN KEY ("user_points_id") REFERENCES "user_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;
