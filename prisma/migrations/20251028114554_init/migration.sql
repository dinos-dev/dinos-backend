/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `bookmarks` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_user_bookmarks";

-- DropIndex
DROP INDEX "idx_user_type_bookmarks";

-- AlterTable
ALTER TABLE "bookmarks" DROP COLUMN "deleted_at";

-- CreateIndex
CREATE INDEX "idx_user_type_bookmarks" ON "bookmarks"("user_id", "item_type");

-- CreateIndex
CREATE INDEX "idx_user_created_at_desc" ON "bookmarks"("user_id", "created_at" DESC);
