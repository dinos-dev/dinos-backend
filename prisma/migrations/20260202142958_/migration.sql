/*
  Warnings:

  - You are about to drop the column `ref_place_id` on the `restaurants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,address]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "restaurants_ref_place_id_key";

-- AlterTable
ALTER TABLE "restaurants" DROP COLUMN "ref_place_id";

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_name_address_key" ON "restaurants"("name", "address");
