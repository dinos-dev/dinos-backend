import { Body, Controller, Post } from '@nestjs/common';
import { ReviewService } from '../application/review.service';
import { CreatePresignedUrlDto } from 'src/common/dto/create.presigned-url.dto';
import { HttpResponse } from 'src/common/http/http-response';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateBulkPresignedUrlDto } from 'src/common/dto/create.presigned-url.bulk.dto';
import { PresignedUrlResponseDto } from 'src/common/dto/presigned-url.response.dto';
import {
  CreateReviewQuestionDocs,
  CreateReviewQuestionsBulkDocs,
  GetBulkPresignedUrlDocs,
  GetPresignedUrlDocs,
} from './swagger/rest-swagger.decorator';
import { CreateReviewQuestionDto } from './dto/request/create-review-question.dto';
import { CreateReviewQuestionsBulkDto } from './dto/request/create-review-questions-bulk.dto';
import { ReviewQuestionResponseDto } from './dto/response/review-question.response.dto';
import { ReviewQuestionsBulkResponseDto } from './dto/response/review-questions-bulk.response.dto';
import { CreateReviewQuestionCommand } from '../application/command/create-review-question.command';
import { CreateReviewQuestionsBulkCommand } from '../application/command/create-review-questions-bulk.command';

@ApiTags('Reviews - 리뷰')
@ApiBearerAuth()
@ApiCommonErrorResponseTemplate()
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

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
