import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Review } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { ReviewAnswerEntity } from 'src/review/domain/entities/review-answer.entity';
import { ReviewEntity } from 'src/review/domain/entities/review.entity';
import { ReviewImageEntity } from 'src/review/domain/entities/review-image.entity';
import { IReviewRepository } from 'src/review/domain/repository/review.repository.interface';
import { ReviewMapper } from '../mapper/review.mapper';

@Injectable()
export class ReviewRepository extends PrismaRepository<Review, ReviewEntity> implements IReviewRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.review);
  }

  /**
   * Review + ReviewAnswer + ReviewImage 일괄 생성 (단일 트랜잭션)
   * @param reviewEntity ReviewEntity
   * @param answerEntities ReviewAnswerEntity[]
   * @param imageEntities ReviewImageEntity[]
   * @returns ReviewEntity
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
}
