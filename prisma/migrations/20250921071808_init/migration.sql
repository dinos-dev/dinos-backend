/*
  Warnings:

  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Token` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_userId_fkey";

-- DropTable
DROP TABLE "Profile";

-- DropTable
DROP TABLE "Token";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(45),
    "password" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "provider" "Provider" NOT NULL DEFAULT 'LOCAL',
    "providerId" VARCHAR(255),
    "profileId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nickName" VARCHAR(20) NOT NULL,
    "comment" VARCHAR(50),
    "headerId" INTEGER,
    "bodyId" INTEGER,
    "headerColor" VARCHAR(8),
    "bodyColor" VARCHAR(8),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "refToken" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "platForm" "PlatFormEnumType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_invite_codes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" VARCHAR(11) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friend_invite_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_providerId_key" ON "users"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_profileId_key" ON "users"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE INDEX "tokens_refToken_idx" ON "tokens"("refToken");

-- CreateIndex
CREATE UNIQUE INDEX "friend_invite_codes_userId_key" ON "friend_invite_codes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "friend_invite_codes_code_key" ON "friend_invite_codes"("code");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_invite_codes" ADD CONSTRAINT "friend_invite_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
