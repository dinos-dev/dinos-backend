import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Review } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { ReviewAnswerEntity } from 'src/review/domain/entities/review-answer.entity';
import { ReviewEntity } from 'src/review/domain/entities/review.entity';
import { ReviewImageEntity } from 'src/review/domain/entities/review-image.entity';
import { IReviewRepository, ReviewUpdateData } from 'src/review/domain/repository/review.repository.interface';
import { ReviewMapper } from '../mapper/review.mapper';

@Injectable()
export class ReviewRepository extends PrismaRepository<Review, ReviewEntity> implements IReviewRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.review);
  }

  /**
   * Review + ReviewAnswer + ReviewImage 일괄 생성 (단일 트랜잭션)
   */
  async createWithAnswersAndImages(
    reviewEntity: ReviewEntity,
    answerEntities: ReviewAnswerEntity[],
    imageEntities: ReviewImageEntity[],
  ): Promise<ReviewEntity> {
    const review = await this.model.create({
      data: {
        userId: reviewEntity.userId,
        restaurantId: reviewEntity.restaurantId,
        content: reviewEntity.content,
        wantRecommendation: reviewEntity.wantRecommendation,
        ...(answerEntities.length > 0 && {
          answers: {
            create: answerEntities.map((a) => ({
              questionId: a.questionId,
              optionId: a.optionId,
              customAnswer: a.customAnswer,
            })),
          },
        }),
        ...(imageEntities.length > 0 && {
          images: {
            create: imageEntities.map((i) => ({
              imageUrl: i.imageUrl,
              isPrimary: i.isPrimary,
              sortOrder: i.sortOrder,
            })),
          },
        }),
      },
    });

    return ReviewMapper.toDomain(review);
  }

  /**
   * 리뷰 수정 (본인 리뷰 여부 확인 포함)
   * - answers가 제공되면 기존 답변 전체 삭제 후 재생성
   * - images가 제공되면 기존 이미지 전체 삭제 후 재생성
   * @returns 수정된 경우 true, 대상 리뷰 없음(본인 아님 포함)이면 false
   */
  async updateReview(reviewId: number, userId: number, data: ReviewUpdateData): Promise<boolean> {
    // 본인 리뷰인지 확인
    const existing = await this.prisma.review.findUnique({
      where: { id: reviewId, userId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) return false;

    // answers가 제공된 경우: 기존 전체 삭제 후 재생성
    if (data.answers !== undefined) {
      await this.prisma.reviewAnswer.deleteMany({ where: { reviewId } });

      if (data.answers.length > 0) {
        await this.prisma.reviewAnswer.createMany({
          data: data.answers.map((a) => ({
            reviewId,
            questionId: a.questionId,
            optionId: a.optionId,
            customAnswer: a.customAnswer,
          })),
        });
      }
    }

    // images가 제공된 경우: 기존 전체 삭제 후 재생성
    if (data.images !== undefined) {
      await this.prisma.reviewImage.deleteMany({ where: { reviewId } });

      if (data.images.length > 0) {
        await this.prisma.reviewImage.createMany({
          data: data.images.map((i) => ({
            reviewId,
            imageUrl: i.imageUrl,
            isPrimary: i.isPrimary,
            sortOrder: i.sortOrder,
          })),
        });
      }
    }

    // 리뷰 본문 업데이트
    await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(data.content !== undefined && { content: data.content }),
        ...(data.wantRecommendation !== undefined && { wantRecommendation: data.wantRecommendation }),
        version: { increment: 1 },
      },
    });

    return true;
  }
}
