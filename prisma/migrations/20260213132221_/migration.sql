-- CreateEnum
CREATE TYPE "ReviewStep" AS ENUM ('BEFORE_ENTRY', 'ENTRY', 'ORDER', 'MEAL', 'WRAP_UP');

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "primary_image_set_by" INTEGER,
ADD COLUMN     "primary_image_url" VARCHAR(500);

-- CreateTable
CREATE TABLE "review_images" (
    "id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_questions" (
    "id" SERIAL NOT NULL,
    "step" "ReviewStep" NOT NULL,
    "content" VARCHAR(500) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_question_options" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "content" VARCHAR(200) NOT NULL,
    "user_tag" VARCHAR(50) NOT NULL,
    "user_tag_label" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_answers" (
    "id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "option_id" INTEGER,
    "custom_answer" VARCHAR(300),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_review_image_primary" ON "review_images"("review_id", "is_primary");

-- CreateIndex
CREATE INDEX "idx_question_step_active" ON "review_questions"("step", "is_active");

-- CreateIndex
CREATE INDEX "idx_option_question" ON "review_question_options"("question_id");

-- CreateIndex
CREATE INDEX "idx_answer_review" ON "review_answers"("review_id");

-- CreateIndex
CREATE INDEX "idx_answer_option" ON "review_answers"("option_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_review_question" ON "review_answers"("review_id", "question_id");

-- AddForeignKey
ALTER TABLE "review_images" ADD CONSTRAINT "review_images_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_question_options" ADD CONSTRAINT "review_question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "review_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_answers" ADD CONSTRAINT "review_answers_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_answers" ADD CONSTRAINT "review_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "review_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_answers" ADD CONSTRAINT "review_answers_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "review_question_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;
