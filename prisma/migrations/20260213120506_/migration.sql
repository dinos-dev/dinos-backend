/*
  Warnings:

  - You are about to drop the column `review_id` on the `pins` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `visited_at` on the `reviews` table. All the data in the column will be lost.
  - You are about to alter the column `content` on the `reviews` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.

*/
-- DropForeignKey
ALTER TABLE "pins" DROP CONSTRAINT "pins_review_id_fkey";

-- DropIndex
DROP INDEX "pins_review_id_key";

-- DropIndex
DROP INDEX "idx_user_reviews";

-- DropIndex
DROP INDEX "unique_user_restaurant_review";

-- AlterTable
ALTER TABLE "pins" DROP COLUMN "review_id";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "rating",
DROP COLUMN "visited_at",
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "want_recommendation" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "content" SET DATA TYPE VARCHAR(500);

-- CreateIndex
CREATE INDEX "idx_user_restaurant_reviews" ON "reviews"("user_id", "restaurant_id");

-- CreateIndex
CREATE INDEX "idx_restaurant_reviews" ON "reviews"("restaurant_id");

-- CreateIndex
CREATE INDEX "idx_want_recommendation" ON "reviews"("want_recommendation");
