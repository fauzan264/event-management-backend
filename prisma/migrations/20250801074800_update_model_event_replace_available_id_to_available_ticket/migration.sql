/*
  Warnings:

  - You are about to drop the column `available_id` on the `event` table. All the data in the column will be lost.
  - Added the required column `available_ticket` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event" DROP COLUMN "available_id",
ADD COLUMN     "available_ticket" INTEGER NOT NULL;
