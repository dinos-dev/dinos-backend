import { Body, Controller, Post } from '@nestjs/common';
import { ReviewService } from '../application/review.service';
import { CreatePresignedUrlDto } from 'src/common/dto/create.presigned-url.dto';
import { HttpResponse } from 'src/common/http/http-response';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateBulkPresignedUrlDto } from 'src/common/dto/create.presigned-url.bulk.dto';
import { PresignedUrlResponseDto } from 'src/common/dto/presigned-url.response.dto';
import { GetBulkPresignedUrlDocs, GetPresignedUrlDocs } from './swagger/rest-swagger.decorator';

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
}
