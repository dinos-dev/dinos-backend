import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CursorPaginatedResponseDto, CursorPaginationQueryDto } from 'src/common/dto/pagination.dto';
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
  DeleteReviewDocs,
  GetBulkPresignedUrlDocs,
  GetMyReviewsDocs,
  GetPresignedUrlDocs,
  GetReviewDetailDocs,
  GetReviewFormQuestionsDocs,
  UpdateReviewDocs,
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
import {
  UpdateReviewAnswerCommand,
  UpdateReviewCommand,
  UpdateReviewImageCommand,
} from '../application/command/update-review.command';
import { CreateReviewResponseDto } from './dto/response/create-review.response.dto';
import { MyReviewResponseDto } from './dto/response/my-reviews.response.dto';
import { UpdateReviewDto } from './dto/request/update-review.dto';
import { ReviewDetailResponseDto } from './dto/response/review-detail.response.dto';
import { UserId } from 'src/common/decorator/user-id.decorator';

@ApiTags('Reviews - 리뷰')
@ApiBearerAuth()
@ApiCommonErrorResponseTemplate()
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // ? 리뷰 작성
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

  // ? 리뷰 삭제 (소프트 삭제)
  @DeleteReviewDocs()
  @Delete(':reviewId')
  async deleteReview(
    @UserId() userId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ): Promise<HttpResponse<void>> {
    await this.reviewService.deleteReview(reviewId, userId);
    return HttpResponse.noContent();
  }

  // ? 리뷰 수정
  @UpdateReviewDocs()
  @Patch(':reviewId')
  async updateReview(
    @UserId() userId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() dto: UpdateReviewDto,
  ): Promise<HttpResponse<ReviewDetailResponseDto>> {
    const command = new UpdateReviewCommand(
      reviewId,
      userId,
      dto.content,
      dto.wantRecommendation,
      dto.answers?.map((a) => new UpdateReviewAnswerCommand(a.questionId, a.optionId ?? null, a.customAnswer ?? null)),
      dto.images?.map((i) => new UpdateReviewImageCommand(i.imageUrl, i.isPrimary, i.sortOrder)),
    );
    const result = await this.reviewService.updateReview(command);
    return HttpResponse.ok(result);
  }

  // ? 내가 작성한 리뷰조회
  @GetMyReviewsDocs()
  @Get('me')
  async getMyReviews(
    @UserId() userId: number,
    @Query() query: CursorPaginationQueryDto,
  ): Promise<HttpResponse<CursorPaginatedResponseDto<MyReviewResponseDto>>> {
    const result = await this.reviewService.getMyReviews(userId, query.cursor ?? null);
    return HttpResponse.ok(result);
  }

  // ? 리뷰 폼 질문 조회
  @GetReviewFormQuestionsDocs()
  @Get('questions/form')
  async getReviewQuestionsForForm(): Promise<HttpResponse<ReviewFormQuestionsResponseDto>> {
    const result = await this.reviewService.getReviewQuestionsForForm();
    return HttpResponse.ok(result);
  }

  // ? 리뷰 단건 상세 조회 (수정 화면 진입용)
  @GetReviewDetailDocs()
  @Get(':reviewId')
  async getReviewDetail(
    @UserId() userId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ): Promise<HttpResponse<ReviewDetailResponseDto>> {
    const result = await this.reviewService.getReviewDetail(reviewId, userId);
    return HttpResponse.ok(result);
  }

  // ? 리뷰 이미지 업로드 전 사전 서명 URL 발급
  @GetPresignedUrlDocs()
  @Post('presigned-url')
  async getSignedUrl(@Body() dto: CreatePresignedUrlDto): Promise<HttpResponse<PresignedUrlResponseDto>> {
    const url = await this.reviewService.getSignedUrl(dto);
    return HttpResponse.ok(url);
  }

  // ? 리뷰 이미지 업로드 전 사전 서명 URL 발급 (여러 개)
  @GetBulkPresignedUrlDocs()
  @Post('presigned-url/bulk')
  async getBulkSignedUrl(@Body() dto: CreateBulkPresignedUrlDto): Promise<HttpResponse<PresignedUrlResponseDto[]>> {
    const urls = await Promise.all(dto.files.map(async (item) => await this.reviewService.getSignedUrl(item)));
    return HttpResponse.ok(urls);
  }

  // ? 리뷰 질문 생성 ( 관리자용 )
  @CreateReviewQuestionDocs()
  @Post('questions')
  async createReviewQuestion(@Body() dto: CreateReviewQuestionDto): Promise<HttpResponse<ReviewQuestionResponseDto>> {
    const command = new CreateReviewQuestionCommand(dto.step, dto.content, dto.sortOrder, dto.options);
    const question = await this.reviewService.createReviewQuestion(command);
    const result = ReviewQuestionResponseDto.fromEntity(question);
    return HttpResponse.created(result);
  }

  // ? 리뷰 질문 일괄 생성 (관리자용)
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
