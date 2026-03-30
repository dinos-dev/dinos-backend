import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';
import { UserId } from 'src/common/decorator/user-id.decorator';
import { HttpResponse } from 'src/common/http/http-response';
import { RecommendationService } from '../application/recommendation.service';
import { RecommendationResponseDto } from './dto/response/recommendation.response.dto';
import { GetMyRecommendationsDocs } from './swagger/rest-swagger.decorator';

@ApiTags('Recommendations - 추천')
@ApiBearerAuth()
@ApiCommonErrorResponseTemplate()
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get()
  @GetMyRecommendationsDocs()
  async getMyRecommendations(@UserId() userId: number): Promise<HttpResponse<RecommendationResponseDto[]>> {
    const recommendations = await this.recommendationService.getMyRecommendations(userId);
    const result = recommendations.map((r) => RecommendationResponseDto.fromDto(r));
    return HttpResponse.ok(result);
  }
}
