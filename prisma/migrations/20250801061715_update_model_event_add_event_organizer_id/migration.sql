/*
  Warnings:

  - Added the required column `event_organizer_id` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event" ADD COLUMN     "event_organizer_id" VARCHAR(36) NOT NULL;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_event_organizer_id_fkey" FOREIGN KEY ("event_organizer_id") REFERENCES "event_organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
