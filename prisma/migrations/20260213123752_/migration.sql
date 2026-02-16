/*
  Warnings:

  - You are about to drop the column `type` on the `pins` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_user_pin_type";

-- AlterTable
ALTER TABLE "pins" DROP COLUMN "type";

-- DropEnum
DROP TYPE "PinType";
