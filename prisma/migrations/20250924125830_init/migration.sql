/*
  Warnings:

  - You are about to drop the column `bodyColor` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `bodyId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `headerColor` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `headerId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `nickName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `platForm` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `refToken` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user_invite_codes` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user_invite_codes` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_invite_codes` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `user_invite_codes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profile_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nick_name` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform` to the `tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ref_token` to the `tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user_invite_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_invite_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlatformEnumType" AS ENUM ('WEB', 'IOS', 'ANDROID', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_invite_codes" DROP CONSTRAINT "user_invite_codes_userId_fkey";

-- DropIndex
DROP INDEX "profiles_userId_key";

-- DropIndex
DROP INDEX "tokens_refToken_idx";

-- DropIndex
DROP INDEX "user_invite_codes_userId_key";

-- DropIndex
DROP INDEX "users_profileId_key";

-- DropIndex
DROP INDEX "users_providerId_key";

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "bodyColor",
DROP COLUMN "bodyId",
DROP COLUMN "createdAt",
DROP COLUMN "headerColor",
DROP COLUMN "headerId",
DROP COLUMN "nickName",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "body_color" VARCHAR(8),
ADD COLUMN     "body_id" INTEGER,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "header_color" VARCHAR(8),
ADD COLUMN     "header_id" INTEGER,
ADD COLUMN     "nick_name" VARCHAR(20) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "platForm",
DROP COLUMN "refToken",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "platform" "PlatformEnumType" NOT NULL,
ADD COLUMN     "ref_token" VARCHAR(255) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_invite_codes" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "isActive",
DROP COLUMN "profileId",
DROP COLUMN "providerId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profile_id" INTEGER,
ADD COLUMN     "provider_id" VARCHAR(255),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "PlatFormEnumType";

-- CreateTable
CREATE TABLE "friend_requests" (
    "id" SERIAL NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
    "responded_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "friend_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" SERIAL NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "addressee_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_receiver_status" ON "friend_requests"("receiver_id", "status");

-- CreateIndex
CREATE INDEX "idx_sender_status" ON "friend_requests"("sender_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "unique_sender_receiver" ON "friend_requests"("sender_id", "receiver_id");

-- CreateIndex
CREATE INDEX "idx_requester_id" ON "friendships"("requester_id");

-- CreateIndex
CREATE INDEX "idx_addressee_id" ON "friendships"("addressee_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_requester_addressee" ON "friendships"("requester_id", "addressee_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "tokens_ref_token_idx" ON "tokens"("ref_token");

-- CreateIndex
CREATE UNIQUE INDEX "user_invite_codes_user_id_key" ON "user_invite_codes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_provider_id_key" ON "users"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_id_key" ON "users"("profile_id");

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invite_codes" ADD CONSTRAINT "user_invite_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
