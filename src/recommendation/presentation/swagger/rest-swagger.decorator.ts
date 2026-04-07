import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiOkResponseTemplate } from 'src/common/swagger/response/api-ok-response';
import { RecommendationResponseDto } from '../dto/response/recommendation.response.dto';
import { ApiErrorResponseTemplate } from 'src/common/swagger/response/api-error-response';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';

export const GetMyRecommendationsDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '개별 유저 추천 식당 조회',
      description: `
      - ML 배치가 사전 계산한 사용자 맞춤 추천 식당 목록을 반환한다.
      - 기본 정렬: score 내림차순, 최대 10개 반환.
      - category 필터 적용 시 해당 카테고리 식당만 반환한다.
      - distance 필터 적용 시 latitude, longitude 는 필수이다. (lat, lon 값을 보내지 않으면 400에러 반환 )
        - nearest: 반경 제한 없이 가까운순 정렬
        - 100 / 500 / 1000 / 3000 / 5000: 해당 반경(m) 이내 필터 + 가까운순 정렬
      - 추천 데이터가 없는 경우 (신규 유저 등) 빈 배열을 반환한다.
      `,
    }),
    ApiOkResponseTemplate({
      description: '개인화 추천 식당 조회 성공',
      type: RecommendationResponseDto,
      isArray: true,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.BAD_REQUEST,
        errorFormatList: [HttpErrorConstants.VALIDATE_ERROR],
      },
    ]),
  );
};
