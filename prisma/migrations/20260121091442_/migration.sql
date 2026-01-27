/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `pins` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,restaurant_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "idx_user_active_pins";

-- DropIndex
DROP INDEX "unique_user_restaurant_review";

-- AlterTable
ALTER TABLE "pins" DROP COLUMN "deleted_at";

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_restaurant_review" ON "reviews"("user_id", "restaurant_id");
