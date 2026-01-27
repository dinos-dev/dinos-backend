/*
  Warnings:

  - A unique constraint covering the columns `[user_id,restaurant_id]` on the table `pins` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "unique_user_restaurant_pin";

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_restaurant_pin" ON "pins"("user_id", "restaurant_id");
