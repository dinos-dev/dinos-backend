-- CreateEnum
CREATE TYPE "PinType" AS ENUM ('PLANNED', 'VISITED');

-- DropIndex
DROP INDEX "idx_created";

-- AlterTable
ALTER TABLE "pins" ADD COLUMN     "type" "PinType" NOT NULL DEFAULT 'PLANNED';

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "content" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "visited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_user_reviews" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_pin_type" ON "pins"("user_id", "type");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
