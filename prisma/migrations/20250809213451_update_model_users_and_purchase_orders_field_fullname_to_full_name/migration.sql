/*
  Warnings:

  - You are about to drop the column `fullname` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the column `fullname` on the `users` table. All the data in the column will be lost.
  - Added the required column `full_name` to the `purchase_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "purchase_orders" DROP COLUMN "fullname",
ADD COLUMN     "full_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "fullname",
ADD COLUMN     "full_name" VARCHAR(100) NOT NULL;
