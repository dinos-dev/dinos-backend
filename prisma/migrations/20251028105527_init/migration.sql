/*
  Warnings:

  - You are about to drop the column `geo_latitude` on the `bookmarks` table. All the data in the column will be lost.
  - You are about to drop the column `geo_longitude` on the `bookmarks` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_geo_bookmarks";

-- AlterTable
ALTER TABLE "bookmarks" DROP COLUMN "geo_latitude",
DROP COLUMN "geo_longitude";
