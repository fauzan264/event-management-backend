/*
  Warnings:

  - You are about to drop the column `userRole` on the `users` table. All the data in the column will be lost.
  - Added the required column `user_role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "userRole",
ADD COLUMN     "user_role" "UserRole" NOT NULL;
