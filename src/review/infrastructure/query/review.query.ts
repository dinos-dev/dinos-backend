import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Review } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { IReviewQuery } from 'src/review/application/interface/review-query.interface';
import { ReviewEntity } from 'src/review/domain/entities/review.entity';
import { CursorPaginatedResult } from 'src/common/types/pagination.types';
import { MyReviewAnswerData, MyReviewEntity, MyReviewImageData } from 'src/review/domain/entities/my-review.entity';
import {
  ReviewDetailEntity,
  ReviewDetailImageData,
  ReviewDetailOptionData,
  ReviewDetailQuestionData,
  ReviewDetailStepData,
  ReviewDetailUserAnswerData,
} from 'src/review/domain/entities/review-detail.entity';
import { ReviewStep } from 'src/review/domain/const/review.enum';
import { ReviewQuestionWithOptionsEntity } from 'src/review/domain/entities/review-question-with-options.entity';
import { ReviewQuestionMapper } from '../mapper/review-question.mapper';

const MY_REVIEWS_DEFAULT_LIMIT = 30;

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

  /**
   * 내가 작성한 리뷰 커서 기반 페이징 조회
   * - restaurant 이름/주소, 답변(질문 텍스트+선택지 텍스트), 이미지 포함
   * - id DESC 정렬 (최신순)
   * @param userId 조회할 사용자 ID
   * @param cursor 마지막으로 받은 리뷰 ID (null이면 첫 페이지)
   * @param limit 페이지당 항목 수 (기본 30)
   */
  async findMyReviews(
    userId: number,
    cursor: number | null,
    limit: number = MY_REVIEWS_DEFAULT_LIMIT,
  ): Promise<CursorPaginatedResult<MyReviewEntity>> {
    const rows = await this.prisma.review.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(cursor != null ? { id: { lt: cursor } } : {}),
      },
      orderBy: { id: 'desc' },
      take: limit + 1, // 다음 페이지 존재 여부 확인용으로 1개 더 조회
      select: {
        id: true,
        content: true,
        wantRecommendation: true,
        createdAt: true,
        restaurant: {
          select: {
            name: true,
            address: true,
          },
        },
        answers: {
          select: {
            questionId: true,
            optionId: true,
            customAnswer: true,
            question: {
              select: { content: true },
            },
            option: {
              select: { content: true },
            },
          },
        },
        images: {
          select: {
            imageUrl: true,
            isPrimary: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    const hasNext = rows.length > limit;
    if (hasNext) rows.pop();

    const reviews = rows.map(
      (row) =>
        new MyReviewEntity(
          row.id,
          row.content,
          row.wantRecommendation,
          row.createdAt,
          row.restaurant.name,
          row.restaurant.address,
          row.answers.map(
            (a) =>
              new MyReviewAnswerData(
                a.questionId,
                a.question.content,
                a.optionId,
                a.option?.content ?? null,
                a.customAnswer,
              ),
          ),
          row.images.map((i) => new MyReviewImageData(i.imageUrl, i.isPrimary, i.sortOrder)),
        ),
    );

    return {
      data: reviews,
      hasNext,
      nextCursor: hasNext ? reviews[reviews.length - 1].id : null,
    };
  }

  /**
   * 리뷰 단건 상세 조회 (수정 화면 진입용)
   * 작성 당시 동일 질문 + 선택지 전체 + 기존 답변 포함
   * 본인 리뷰가 아닌 경우 null 반환
   * @param reviewId 조회할 리뷰 ID
   * @param userId 요청 사용자 ID
   */
  async findReviewDetail(reviewId: number, userId: number): Promise<ReviewDetailEntity | null> {
    const row = await this.prisma.review.findUnique({
      where: { id: reviewId, userId, deletedAt: null },
      select: {
        id: true,
        content: true,
        wantRecommendation: true,
        createdAt: true,
        restaurant: {
          select: { name: true, address: true },
        },
        answers: {
          select: {
            questionId: true,
            optionId: true,
            customAnswer: true,
            question: {
              select: {
                id: true,
                step: true,
                content: true,
                options: {
                  where: { isActive: true },
                  select: { id: true, content: true, sortOrder: true },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
        images: {
          select: { imageUrl: true, isPrimary: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!row) return null;

    // step 순서 고정 (BEFORE_ENTRY → ENTRY → ORDER → MEAL → WRAP_UP)
    const stepOrder = [
      ReviewStep.BEFORE_ENTRY,
      ReviewStep.ENTRY,
      ReviewStep.ORDER,
      ReviewStep.MEAL,
      ReviewStep.WRAP_UP,
    ];

    const steps = row.answers
      .slice()
      .sort(
        (a, b) => stepOrder.indexOf(a.question.step as ReviewStep) - stepOrder.indexOf(b.question.step as ReviewStep),
      )
      .map(
        (a) =>
          new ReviewDetailStepData(
            a.question.step as ReviewStep,
            new ReviewDetailQuestionData(
              a.question.id,
              a.question.content,
              a.question.options.map((o) => new ReviewDetailOptionData(o.id, o.content, o.sortOrder)),
            ),
            new ReviewDetailUserAnswerData(a.optionId, a.customAnswer),
          ),
      );

    return new ReviewDetailEntity(
      row.id,
      row.content,
      row.wantRecommendation,
      row.createdAt,
      row.restaurant.name,
      row.restaurant.address,
      steps,
      row.images.map((i) => new ReviewDetailImageData(i.imageUrl, i.isPrimary, i.sortOrder)),
    );
  }
}
