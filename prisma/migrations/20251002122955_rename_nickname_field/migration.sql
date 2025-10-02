/*
  Warnings:

  - You are about to drop the column `nick_name` on the `profiles` table. All the data in the column will be lost.
  - Added the required column `nickname` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- RenameColum
ALTER TABLE "profiles" RENAME COLUMN "nick_name" TO "nickname";