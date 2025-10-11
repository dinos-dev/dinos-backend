-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('MEAL_TOGETHER');

-- CreateTable
CREATE TABLE "friendship_activities" (
    "id" SERIAL NOT NULL,
    "friendship_id" INTEGER NOT NULL,
    "activity_type" "ActivityType" NOT NULL DEFAULT 'MEAL_TOGETHER',
    "activity_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "friendship_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_friendship_activity_type" ON "friendship_activities"("friendship_id", "activity_type");

-- CreateIndex
CREATE INDEX "idx_activity_date" ON "friendship_activities"("activity_date");

-- AddForeignKey
ALTER TABLE "friendship_activities" ADD CONSTRAINT "friendship_activities_friendship_id_fkey" FOREIGN KEY ("friendship_id") REFERENCES "friendships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
