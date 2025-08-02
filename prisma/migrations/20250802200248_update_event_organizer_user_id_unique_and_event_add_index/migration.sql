/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `event_organizer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "event_event_organizer_id_idx" ON "event"("event_organizer_id");

-- CreateIndex
CREATE INDEX "event_event_name_idx" ON "event"("event_name");

-- CreateIndex
CREATE INDEX "event_category_idx" ON "event"("category");

-- CreateIndex
CREATE INDEX "event_deleted_at_idx" ON "event"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "event_organizer_user_id_key" ON "event_organizer"("user_id");
