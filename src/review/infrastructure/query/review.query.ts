import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Prisma, Review } from '@prisma/client';
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
import { NearbyReviewOptionsDto } from 'src/review/application/dto/nearby-review-options.dto';
import { ReviewedRestaurantNearbyDto } from 'src/review/application/dto/reviewed-restaurant-nearby.dto';

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

  /**
   * 전달된 questionId들 중 WRAP_UP 단계에 해당하는 항목 수 반환
   * @param questionIds 유효한 응답(optionId 또는 customAnswer)이 있는 questionId 배열
   * @returns WRAP_UP step에 속하는 질문 수
   */
  async countWrapUpAmongIds(questionIds: number[]): Promise<number> {
    if (questionIds.length === 0) return 0;

    return this.prisma.reviewQuestion.count({
      where: {
        id: { in: questionIds },
        step: ReviewStep.WRAP_UP,
        isActive: true,
      },
    });
  }

  /**
   * 내가 리뷰를 작성한 가게를 지도(bbox) 범위 내에서 거리순으로 조회
   * - 가게 단위로 dedupe (같은 가게 다중 리뷰 → 최신 1건 내용 + count로 접음)
   * - 내가 핀한 가게면 isPinned/pinnedAt 교차 정보를 함께 반환
   * @param userId 현재 사용자 ID
   * @param options bbox + 사용자 좌표 + limit
   * @returns 거리순 정렬된 (가게 + 내 리뷰 요약 + 핀 여부)
   */
  async findNearbyReviewedRestaurants(
    userId: number,
    options: NearbyReviewOptionsDto,
  ): Promise<ReviewedRestaurantNearbyDto[]> {
    const { userLat, userLng, minLat, maxLat, minLng, maxLng, limit } = options;

    const query = Prisma.sql`
      SELECT
        r.id AS restaurant_id,
        r.name AS restaurant_name,
        r.latitude,
        r.longitude,
        r.address,
        r.category,
        r.primary_image_url,
        myr.last_review_content,
        myr.last_reviewed_at,
        p.id AS pin_id,
        p.created_at AS pinned_at,
        -- 이 가게를 나와 동일하게 핀한 친구 수
        COALESCE(fpc.friend_pin_count, 0) AS friend_pin_count,
        -- 거리 계산 (Haversine)
        (
          6371 * acos(
            cos(radians(${userLat}))
            * cos(radians(r.latitude))
            * cos(radians(r.longitude) - radians(${userLng}))
            + sin(radians(${userLat}))
            * sin(radians(r.latitude))
          )
        ) AS distance_km

      -- 내가 쓴 리뷰를 가게 단위로 집계 (최신 1건 내용 + 개수 + 최신 작성일)
      FROM (
        SELECT
          rv.restaurant_id,
          max(rv.created_at) AS last_reviewed_at,
          (array_agg(rv.content ORDER BY rv.created_at DESC, rv.id DESC))[1] AS last_review_content
        FROM reviews rv
        WHERE rv.user_id = ${userId}
          AND rv.deleted_at IS NULL
        GROUP BY rv.restaurant_id
      ) myr
      INNER JOIN restaurants r ON myr.restaurant_id = r.id
      -- 핀은 (user, restaurant) 유니크라 0..1건 → 단순 LEFT JOIN
      LEFT JOIN pins p ON p.user_id = ${userId} AND p.restaurant_id = r.id
      -- 나와 친구인 사용자 중 이 가게를 핀한 친구 수 (친구관계는 양방향 확인, 본인 제외)
      LEFT JOIN LATERAL (
        SELECT count(DISTINCT fp.user_id)::int AS friend_pin_count
        FROM pins fp
        INNER JOIN friendships f
          ON (f.requester_id = ${userId} AND f.addressee_id = fp.user_id)
          OR (f.addressee_id = ${userId} AND f.requester_id = fp.user_id)
        WHERE fp.restaurant_id = r.id
          AND fp.user_id <> ${userId}
      ) fpc ON TRUE

      WHERE
        r.latitude BETWEEN ${minLat} AND ${maxLat}
        AND r.longitude BETWEEN ${minLng} AND ${maxLng}

      ORDER BY distance_km ASC
      LIMIT ${limit};
    `;

    const result: any[] = await this.prisma.$queryRaw(query);

    return result.map(
      (row) =>
        new ReviewedRestaurantNearbyDto(
          Number(row.restaurant_id),
          row.restaurant_name,
          Number(row.latitude),
          Number(row.longitude),
          row.address,
          row.category,
          row.primary_image_url ?? null,
          Number(row.distance_km),
          row.last_review_content ?? null,
          row.last_reviewed_at,
          row.pin_id != null,
          row.pinned_at ?? null,
          Number(row.friend_pin_count ?? 0),
        ),
    );
  }
}
