import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiOkResponseTemplate } from 'src/common/swagger/response/api-ok-response';
import { RecommendationResponseDto } from '../dto/response/recommendation.response.dto';

export const GetMyRecommendationsDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '개인화 추천 식당 조회',
      description: `
      - ML 배치가 사전 계산한 사용자 맞춤 추천 식당 목록을 반환한다.
      - score 내림차순으로 최대 20개가 반환된다.
      - 추천 데이터가 없는 경우 (신규 유저 등) 빈 배열을 반환한다.
      `,
    }),
    ApiOkResponseTemplate({
      description: '개인화 추천 식당 조회 성공',
      type: RecommendationResponseDto,
      isArray: true,
    }),
  );
};
