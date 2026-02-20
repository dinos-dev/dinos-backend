import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  FILE_UPLOAD_SERVICE,
  REVIEW_QUERY_REPOSITORY,
  REVIEW_QUESTION_REPOSITORY,
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

@Injectable()
export class ReviewService {
  constructor(
    @Inject(FILE_UPLOAD_SERVICE)
    private readonly fileUploadService: IFileUploadService,
    @Inject(REVIEW_QUESTION_REPOSITORY)
    private readonly reviewQuestionRepository: IReviewQuestionRepository,
    @Inject(REVIEW_QUERY_REPOSITORY)
    private readonly reviewQuery: IReviewQuery,
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
