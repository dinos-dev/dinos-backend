import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { FILE_UPLOAD_SERVICE, REVIEW_QUESTION_REPOSITORY } from 'src/common/config/common.const';
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

@Injectable()
export class ReviewService {
  constructor(
    @Inject(FILE_UPLOAD_SERVICE)
    private readonly fileUploadService: IFileUploadService,
    @Inject(REVIEW_QUESTION_REPOSITORY)
    private readonly reviewQuestionRepository: IReviewQuestionRepository,
    private readonly logger: WinstonLoggerService,
  ) {}

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
