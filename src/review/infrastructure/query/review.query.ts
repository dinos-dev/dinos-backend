import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Review } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { IReviewQuery } from 'src/review/application/interface/review-query.interface';
import { ReviewEntity } from 'src/review/domain/entities/review.entity';
import { ReviewQuestionWithOptionsEntity } from 'src/review/domain/entities/review-question-with-options.entity';
import { ReviewQuestionMapper } from '../mapper/review-question.mapper';

@Injectable()
export class ReviewQuery extends PrismaRepository<Review, ReviewEntity> implements IReviewQuery {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.review);
  }

  /**
   * 리뷰 폼용 활성 질문 전체 조회 (options 포함, userTagLabel 제외)
   * @returns ReviewQuestionWithOptionsEntity[]
   */
  async findAllActiveWithOptions(): Promise<ReviewQuestionWithOptionsEntity[]> {
    const questions = await this.prisma.reviewQuestion.findMany({
      where: { isActive: true },
      select: {
        id: true,
        step: true,
        content: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        options: {
          where: { isActive: true },
          select: {
            id: true,
            questionId: true,
            content: true,
            sortOrder: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return questions.map((q) => ReviewQuestionMapper.toDomainWithOptions(q));
  }
}
