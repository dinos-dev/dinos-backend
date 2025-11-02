/*
  Warnings:

  - Made the column `restaurant_ref_id` on table `bookmarks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "bookmarks" ALTER COLUMN "restaurant_ref_id" SET NOT NULL;
