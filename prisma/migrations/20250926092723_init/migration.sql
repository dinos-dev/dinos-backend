/*
  Warnings:

  - You are about to drop the `user_invite_codes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[invite_code_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "user_invite_codes" DROP CONSTRAINT "user_invite_codes_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "invite_code_id" INTEGER;

-- DropTable
DROP TABLE "user_invite_codes";

-- CreateTable
CREATE TABLE "invite_codes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "code" VARCHAR(11) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invite_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invite_codes_user_id_key" ON "invite_codes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invite_codes_code_key" ON "invite_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_invite_code_id_key" ON "users"("invite_code_id");

-- AddForeignKey
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
