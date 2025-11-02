-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('LOCAL', 'GOOGLE', 'APPLE', 'NAVER', 'KAKAO');

-- CreateEnum
CREATE TYPE "PlatformEnumType" AS ENUM ('WEB', 'IOS', 'ANDROID', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('MEAL_TOGETHER');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('FEED', 'RESTAURANT');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(45),
    "password" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "provider" "Provider" NOT NULL DEFAULT 'LOCAL',
    "provider_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nickname" VARCHAR(20) NOT NULL,
    "comment" VARCHAR(50),
    "header_id" INTEGER,
    "body_id" INTEGER,
    "header_color" VARCHAR(8),
    "body_color" VARCHAR(8),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ref_token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "platform" "PlatformEnumType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite_codes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "code" VARCHAR(11) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invite_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendship_activities" (
    "id" SERIAL NOT NULL,
    "friendship_id" INTEGER NOT NULL,
    "activity_type" "ActivityType" NOT NULL DEFAULT 'MEAL_TOGETHER',
    "activity_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "friendship_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "item_type" "ItemType" NOT NULL,
    "feed_ref_id" VARCHAR(24) NOT NULL,
    "restaurant_ref_id" VARCHAR(24),
    "item_name" VARCHAR(50) NOT NULL,
    "item_image_url" VARCHAR(500),
    "item_sub" VARCHAR(50) NOT NULL,
    "geo_latitude" DECIMAL(11,8),
    "geo_longitude" DECIMAL(11,8),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_provider_id_key" ON "users"("provider_id");

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
CREATE UNIQUE INDEX "invite_codes_user_id_key" ON "invite_codes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invite_codes_code_key" ON "invite_codes"("code");

-- CreateIndex
CREATE INDEX "idx_friendship_activity_type" ON "friendship_activities"("friendship_id", "activity_type");

-- CreateIndex
CREATE INDEX "idx_activity_date" ON "friendship_activities"("activity_date");

-- CreateIndex
CREATE INDEX "idx_user_bookmarks" ON "bookmarks"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_user_type_bookmarks" ON "bookmarks"("user_id", "item_type", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_geo_bookmarks" ON "bookmarks"("geo_latitude", "geo_longitude", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_feed_ref_id_restaurant_ref_id_key" ON "bookmarks"("user_id", "feed_ref_id", "restaurant_ref_id");

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
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship_activities" ADD CONSTRAINT "friendship_activities_friendship_id_fkey" FOREIGN KEY ("friendship_id") REFERENCES "friendships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
