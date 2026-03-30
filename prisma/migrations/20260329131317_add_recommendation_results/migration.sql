-- CreateTable
CREATE TABLE "recommendation_results" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "recommendations" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recommendation_results_user_id_key" ON "recommendation_results"("user_id");

-- CreateIndex
CREATE INDEX "idx_recommendation_user_id" ON "recommendation_results"("user_id");

-- AddForeignKey
ALTER TABLE "recommendation_results" ADD CONSTRAINT "recommendation_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
