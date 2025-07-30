/*
  Warnings:

  - You are about to drop the column `password` on the `event_organizer` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `event_organizer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userRole` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'EVENT_ORGANIZER');

-- AlterTable
ALTER TABLE "event_organizer" DROP COLUMN "password",
ADD COLUMN     "user_id" VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "userRole" "UserRole" NOT NULL;

-- AddForeignKey
ALTER TABLE "event_organizer" ADD CONSTRAINT "event_organizer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
