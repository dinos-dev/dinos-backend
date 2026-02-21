import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import {
  FILE_UPLOAD_SERVICE,
  RESTAURANT_REPOSITORY,
  REVIEW_QUERY_REPOSITORY,
  REVIEW_QUESTION_REPOSITORY,
  REVIEW_REPOSITORY,
} from 'src/common/config/common.const';
import { CreatePresignedUrlDto } from 'src/common/dto/create.presigned-url.dto';
import { PresignedUrlResponseDto } from 'src/common/dto/presigned-url.response.dto';
import { IFileUploadService } from 'src/common/interface/file-upload.interface';
import { CreateReviewQuestionCommand } from './command/create-review-question.command';
import { CreateReviewQuestionsBulkCommand } from './command/create-review-questions-bulk.command';
import { IReviewQuestionRepository } from '../domain/repository/review-question.repository.interface';
import { ReviewQuestionEntity } from '../domain/entities/review-question.entity';
import { ReviewQuestionOptionEntity } from '../domain/entities/review-question-option.entity';
import { Transactional } from '@nestjs-cls/transactional';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { WinstonLoggerService } from 'src/infrastructure/logger/winston-logger.service';
import { IReviewQuery } from './interface/review-query.interface';
import { ReviewStep } from '../domain/const/review.enum';
import { ReviewQuestionWithOptionsEntity } from '../domain/entities/review-question-with-options.entity';
import { ReviewFormQuestionsResponseDto } from '../presentation/dto/response/review-form-questions.response.dto';
import { IReviewRepository } from '../domain/repository/review.repository.interface';
import { IRestaurantRepository } from 'src/restaurant/domain/repository/restaurant.repository.interface';
import { CreateReviewCommand } from './command/create-review.command';
import { UpdateReviewCommand } from './command/update-review.command';
import { ReviewEntity } from '../domain/entities/review.entity';
import { RestaurantEntity } from 'src/restaurant/domain/entities/restaurant.entity';
import { ReviewAnswerEntity } from '../domain/entities/review-answer.entity';
import { ReviewImageEntity } from '../domain/entities/review-image.entity';
import { CursorPaginatedResponseDto } from 'src/common/dto/pagination.dto';
import { CreateReviewResponseDto } from '../presentation/dto/response/create-review.response.dto';
import { MyReviewResponseDto } from '../presentation/dto/response/my-reviews.response.dto';
import { ReviewDetailResponseDto } from '../presentation/dto/response/review-detail.response.dto';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(FILE_UPLOAD_SERVICE)
    private readonly fileUploadService: IFileUploadService,
    @Inject(REVIEW_QUESTION_REPOSITORY)
    private readonly reviewQuestionRepository: IReviewQuestionRepository,
    @Inject(REVIEW_QUERY_REPOSITORY)
    private readonly reviewQuery: IReviewQuery,
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly logger: WinstonLoggerService,
  ) {}

  /**
   * 리뷰 폼 질문 조회 - step별 랜덤 1개 반환
   * @returns ReviewFormQuestionsResponseDto
   */
  async getReviewQuestionsForForm(): Promise<ReviewFormQuestionsResponseDto> {
    // 1) 현재 활성화된 리뷰 데이터를 일괄로 조회 ( 리뷰는 초반에 많이 없고 Step 별로 일일이 쿼리해서 가공하는건 비효율적이기 때문에 애플리케이션 레벨에서 조정 )
    const allQuestions = await this.reviewQuery.findAllActiveWithOptions();

    // 2) 각 리뷰의 Step 별 랜덤 1개 질문을 선택
    const steps = Object.values(ReviewStep).map((step) => {
      const candidates = allQuestions.filter((q) => q.step === step);

      if (candidates.length === 0) {
        return { step, question: null as ReviewQuestionWithOptionsEntity | null };
      }

      const randomIndex = Math.floor(Math.random() * candidates.length);
      return { step, question: candidates[randomIndex] };
    });

    return ReviewFormQuestionsResponseDto.from(steps);
  }

  /**
   * 리뷰 수정
   * - 본인 리뷰가 아니거나 존재하지 않으면 404
   * - answers, images는 제공 시 전체 교체 / 생략 시 유지
   * @param command UpdateReviewCommand
   */
  @Transactional()
  async updateReview(command: UpdateReviewCommand): Promise<ReviewDetailResponseDto> {
    const answerEntities = command.answers?.map((a) =>
      ReviewAnswerEntity.create({ questionId: a.questionId, optionId: a.optionId, customAnswer: a.customAnswer }),
    );

    const imageEntities = command.images?.map((i) =>
      ReviewImageEntity.create({ imageUrl: i.imageUrl, isPrimary: i.isPrimary, sortOrder: i.sortOrder }),
    );

    const updated = await this.reviewRepository.updateReview(command.reviewId, command.userId, {
      content: command.content,
      wantRecommendation: command.wantRecommendation,
      answers: answerEntities,
      images: imageEntities,
    });

    if (!updated) {
      throw new NotFoundException(HttpErrorConstants.NOT_FOUND_REVIEW);
    }

    // 수정 후 최신 상태 반환
    return this.getReviewDetail(command.reviewId, command.userId);
  }

  /**
   * 리뷰 소프트 삭제
   * - 본인 리뷰가 아니거나 존재하지 않으면 404
   * @param reviewId 삭제할 리뷰 ID
   * @param userId 요청 사용자 ID
   */
  async deleteReview(reviewId: number, userId: number): Promise<void> {
    const deleted = await this.reviewRepository.softDeleteReview(reviewId, userId);

    if (!deleted) {
      throw new NotFoundException(HttpErrorConstants.NOT_FOUND_REVIEW);
    }
  }

  /**
   * 리뷰 단건 상세 조회 (수정 화면 진입용)
   * - 본인 리뷰가 아니거나 존재하지 않으면 404
   * @param reviewId 조회할 리뷰 ID
   * @param userId 요청 사용자 ID
   */
  async getReviewDetail(reviewId: number, userId: number): Promise<ReviewDetailResponseDto> {
    const entity = await this.reviewQuery.findReviewDetail(reviewId, userId);

    if (!entity) {
      throw new NotFoundException(HttpErrorConstants.NOT_FOUND_REVIEW);
    }

    return ReviewDetailResponseDto.from(entity);
  }

  /**
   * 내가 작성한 리뷰 목록 조회 (커서 기반 페이징, 최신순)
   * @param userId 요청 사용자 ID
   * @param cursor 이전 페이지 마지막 리뷰 ID (null이면 첫 페이지)
   * @returns MyReviewsResponseDto
   */
  async getMyReviews(userId: number, cursor: number | null): Promise<CursorPaginatedResponseDto<MyReviewResponseDto>> {
    const result = await this.reviewQuery.findMyReviews(userId, cursor, 30);
    return CursorPaginatedResponseDto.from(result, MyReviewResponseDto.from);
  }

  /**
   * 리뷰 작성
   * @param command CreateReviewCommand
   * @returns CreateReviewResponseDto
   */
  @Transactional()
  async createReview(command: CreateReviewCommand): Promise<CreateReviewResponseDto> {
    try {
      //? 1. Restaurant upsert (name + address 기준 조회 → 없으면 생성)
      const restaurantEntity = RestaurantEntity.create({
        name: command.restaurant.name,
        address: command.restaurant.address,
        latitude: command.restaurant.latitude,
        longitude: command.restaurant.longitude,
      });

      const restaurant = await this.restaurantRepository.upsertRestaurantByNameAndAddress(restaurantEntity);

      //? 2. ReviewEntity 생성
      const reviewEntity = ReviewEntity.create({
        userId: command.userId,
        restaurantId: restaurant.id,
        content: command.content,
        wantRecommendation: command.wantRecommendation,
      });

      //? 3. ReviewAnswerEntity 배열 생성
      const answerEntities = command.answers.map((a) =>
        ReviewAnswerEntity.create({
          questionId: a.questionId,
          optionId: a.optionId,
          customAnswer: a.customAnswer,
        }),
      );

      //? 4. ReviewImageEntity 배열 생성
      const imageEntities = command.images.map((i) =>
        ReviewImageEntity.create({
          imageUrl: i.imageUrl,
          isPrimary: i.isPrimary,
          sortOrder: i.sortOrder,
        }),
      );

      //? 5. Review + Answers + Images 단일 트랜잭션 생성
      const review = await this.reviewRepository.createWithAnswersAndImages(
        reviewEntity,
        answerEntities,
        imageEntities,
      );

      //? 6. Restaurant 대표 이미지 업데이트 (primaryImageSetBy가 null인 경우에만 → 최초 리뷰어 이미지 채택)
      const primaryImage = command.images.find((i) => i.isPrimary);
      if (primaryImage) {
        await this.restaurantRepository.updatePrimaryImageIfNotSet(
          restaurant.id,
          primaryImage.imageUrl,
          command.userId,
        );
      }

      return CreateReviewResponseDto.fromEntity(review);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 리뷰 이미지 업로드를 위한 Signed URL 발급
   * @param dto CreatePresignedUrlDto
   * @returns PresignedUrlResponseDto
   */
  async getSignedUrl(dto: CreatePresignedUrlDto): Promise<PresignedUrlResponseDto> {
    return await this.fileUploadService.createPresignedUrl(dto, 'reviews');
  }

  /**
   * 리뷰 질문 생성
   * @param command CreateReviewQuestionCommand
   * @returns ReviewQuestionEntity
   */
  @Transactional()
  async createReviewQuestion(command: CreateReviewQuestionCommand): Promise<ReviewQuestionEntity> {
    try {
      //? 1. ReviewQuestionEntity 생성
      const questionEntity = ReviewQuestionEntity.create({
        step: command.step,
        content: command.content,
        sortOrder: command.sortOrder,
      });

      //? 2. ReviewQuestionOptionEntity 배열 생성
      const optionEntities = command.options.map((option) =>
        ReviewQuestionOptionEntity.create({
          questionId: null, // Repository에서 자동으로 할당됨
          content: option.content,
          userTagLabel: option.userTagLabel,
          sortOrder: option.sortOrder,
        }),
      );

      //? 3. 질문과 선택지를 함께 저장
      return await this.reviewQuestionRepository.createWithOptions(questionEntity, optionEntities);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 리뷰 질문 일괄 생성 (Bulk)
   * @param command CreateReviewQuestionsBulkCommand
   * @returns ReviewQuestionEntity[]
   */
  @Transactional()
  async createReviewQuestionsBulk(command: CreateReviewQuestionsBulkCommand): Promise<ReviewQuestionEntity[]> {
    try {
      const createdQuestions: ReviewQuestionEntity[] = [];

      //? 각 질문을 순회하며 생성
      for (const questionCommand of command.questions) {
        const createdQuestion = await this.createReviewQuestion(questionCommand);
        createdQuestions.push(createdQuestion);
      }

      return createdQuestions;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
    }
  }
}
