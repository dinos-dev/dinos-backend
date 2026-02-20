import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReviewService } from '../application/review.service';
import { CreatePresignedUrlDto } from 'src/common/dto/create.presigned-url.dto';
import { HttpResponse } from 'src/common/http/http-response';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateBulkPresignedUrlDto } from 'src/common/dto/create.presigned-url.bulk.dto';
import { PresignedUrlResponseDto } from 'src/common/dto/presigned-url.response.dto';
import {
  CreateReviewDocs,
  CreateReviewQuestionDocs,
  CreateReviewQuestionsBulkDocs,
  GetBulkPresignedUrlDocs,
  GetPresignedUrlDocs,
  GetReviewFormQuestionsDocs,
} from './swagger/rest-swagger.decorator';
import { CreateReviewQuestionDto } from './dto/request/create-review-question.dto';
import { CreateReviewQuestionsBulkDto } from './dto/request/create-review-questions-bulk.dto';
import { ReviewQuestionResponseDto } from './dto/response/review-question.response.dto';
import { ReviewQuestionsBulkResponseDto } from './dto/response/review-questions-bulk.response.dto';
import { CreateReviewQuestionCommand } from '../application/command/create-review-question.command';
import { CreateReviewQuestionsBulkCommand } from '../application/command/create-review-questions-bulk.command';
import { ReviewFormQuestionsResponseDto } from './dto/response/review-form-questions.response.dto';
import { CreateReviewDto } from './dto/request/create-review.dto';
import {
  CreateReviewAnswerCommand,
  CreateReviewCommand,
  CreateReviewImageCommand,
  CreateReviewRestaurantCommand,
} from '../application/command/create-review.command';
import { CreateReviewResponseDto } from './dto/response/create-review.response.dto';
import { UserId } from 'src/common/decorator/user-id.decorator';

@ApiTags('Reviews - 리뷰')
@ApiBearerAuth()
@ApiCommonErrorResponseTemplate()
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @CreateReviewDocs()
  @Post()
  async createReview(
    @UserId() userId: number,
    @Body() dto: CreateReviewDto,
  ): Promise<HttpResponse<CreateReviewResponseDto>> {
    //? 1. CreateReviewCommand 생성
    const command = new CreateReviewCommand(
      userId,
      new CreateReviewRestaurantCommand(
        dto.restaurant.name,
        dto.restaurant.address,
        dto.restaurant.latitude,
        dto.restaurant.longitude,
      ),
      dto.content ?? null,
      dto.wantRecommendation,
      (dto.answers ?? []).map(
        (a) => new CreateReviewAnswerCommand(a.questionId, a.optionId ?? null, a.customAnswer ?? null),
      ),
      (dto.images ?? []).map((i) => new CreateReviewImageCommand(i.imageUrl, i.isPrimary, i.sortOrder)),
    );

    //? 2. 리뷰 생성
    const result = await this.reviewService.createReview(command);
    return HttpResponse.created(result);
  }

  @GetReviewFormQuestionsDocs()
  @Get('questions/form')
  async getReviewQuestionsForForm(): Promise<HttpResponse<ReviewFormQuestionsResponseDto>> {
    const result = await this.reviewService.getReviewQuestionsForForm();
    return HttpResponse.ok(result);
  }

  @GetPresignedUrlDocs()
  @Post('presigned-url')
  async getSignedUrl(@Body() dto: CreatePresignedUrlDto): Promise<HttpResponse<PresignedUrlResponseDto>> {
    const url = await this.reviewService.getSignedUrl(dto);
    return HttpResponse.ok(url);
  }

  @GetBulkPresignedUrlDocs()
  @Post('presigned-url/bulk')
  async getBulkSignedUrl(@Body() dto: CreateBulkPresignedUrlDto): Promise<HttpResponse<PresignedUrlResponseDto[]>> {
    const urls = await Promise.all(dto.files.map(async (item) => await this.reviewService.getSignedUrl(item)));
    return HttpResponse.ok(urls);
  }

  @CreateReviewQuestionDocs()
  @Post('questions')
  async createReviewQuestion(@Body() dto: CreateReviewQuestionDto): Promise<HttpResponse<ReviewQuestionResponseDto>> {
    const command = new CreateReviewQuestionCommand(dto.step, dto.content, dto.sortOrder, dto.options);
    const question = await this.reviewService.createReviewQuestion(command);
    const result = ReviewQuestionResponseDto.fromEntity(question);
    return HttpResponse.created(result);
  }

  @CreateReviewQuestionsBulkDocs()
  @Post('questions/bulk')
  async createReviewQuestionsBulk(
    @Body() dto: CreateReviewQuestionsBulkDto,
  ): Promise<HttpResponse<ReviewQuestionsBulkResponseDto>> {
    const commands = dto.questions.map(
      (q) => new CreateReviewQuestionCommand(q.step, q.content, q.sortOrder, q.options),
    );
    const bulkCommand = new CreateReviewQuestionsBulkCommand(commands);
    const questions = await this.reviewService.createReviewQuestionsBulk(bulkCommand);
    const results = questions.map((q) => ReviewQuestionResponseDto.fromEntity(q));
    const result = ReviewQuestionsBulkResponseDto.fromEntities(results);
    return HttpResponse.created(result);
  }
}
