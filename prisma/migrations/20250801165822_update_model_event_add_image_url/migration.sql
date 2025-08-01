/*
  Warnings:

  - Added the required column `image_url` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event" ADD COLUMN     "image_url" TEXT NOT NULL;
