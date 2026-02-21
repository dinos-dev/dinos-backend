import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { ReviewQuestion } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { ReviewQuestionEntity } from 'src/review/domain/entities/review-question.entity';
import { ReviewQuestionOptionEntity } from 'src/review/domain/entities/review-question-option.entity';
import { IReviewQuestionRepository } from 'src/review/domain/repository/review-question.repository.interface';
import { ReviewQuestionMapper } from '../mapper/review-question.mapper';

@Injectable()
export class ReviewQuestionRepository
  extends PrismaRepository<ReviewQuestion, ReviewQuestionEntity>
  implements IReviewQuestionRepository
{
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.reviewQuestion);
  }

  /**
   * Create Review Question with Options
   * @param questionEntity ReviewQuestionEntity
   * @param optionEntities ReviewQuestionOptionEntity[]
   * @returns ReviewQuestionEntity
   */
  async createWithOptions(
    questionEntity: ReviewQuestionEntity,
    optionEntities: ReviewQuestionOptionEntity[],
  ): Promise<ReviewQuestionEntity> {
    const question = await this.model.create({
      data: {
        step: questionEntity.step,
        content: questionEntity.content,
        isActive: questionEntity.isActive,
        sortOrder: questionEntity.sortOrder,
        options: {
          create: optionEntities.map((option) => ({
            content: option.content,
            userTagLabel: option.userTagLabel,
            sortOrder: option.sortOrder,
            isActive: option.isActive,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    return ReviewQuestionMapper.toDomain(question);
  }
}
