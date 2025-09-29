/*
  Warnings:

  - You are about to drop the `friend_invite_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "friend_invite_codes" DROP CONSTRAINT "friend_invite_codes_userId_fkey";

-- DropTable
DROP TABLE "friend_invite_codes";

-- CreateTable
CREATE TABLE "user_invite_codes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" VARCHAR(11) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_invite_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_invite_codes_userId_key" ON "user_invite_codes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_invite_codes_code_key" ON "user_invite_codes"("code");

-- AddForeignKey
ALTER TABLE "user_invite_codes" ADD CONSTRAINT "user_invite_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
