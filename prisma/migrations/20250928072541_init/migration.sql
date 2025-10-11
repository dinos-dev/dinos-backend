/*
  Warnings:

  - You are about to drop the column `invite_code_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profile_id` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_invite_code_id_key";

-- DropIndex
DROP INDEX "users_profile_id_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "invite_code_id",
DROP COLUMN "profile_id";
