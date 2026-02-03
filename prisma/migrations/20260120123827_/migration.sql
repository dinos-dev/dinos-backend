/*
  Warnings:

  - A unique constraint covering the columns `[review_id]` on the table `pins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,restaurant_id,deleted_at]` on the table `pins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,restaurant_id,deleted_at]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "unique_user_restaurant";

-- AlterTable
ALTER TABLE "pins" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "review_id" INTEGER;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "pins_review_id_key" ON "pins"("review_id");

-- CreateIndex
CREATE INDEX "idx_user_active_pins" ON "pins"("user_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_restaurant_pin" ON "pins"("user_id", "restaurant_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_restaurant_review" ON "reviews"("user_id", "restaurant_id", "deleted_at");

-- AddForeignKey
ALTER TABLE "pins" ADD CONSTRAINT "pins_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;
