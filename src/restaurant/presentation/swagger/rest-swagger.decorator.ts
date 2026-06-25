import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { ApiErrorResponseTemplate } from 'src/common/swagger/response/api-error-response';
import { ApiOkResponseTemplate } from 'src/common/swagger/response/api-ok-response';
import { SearchRestaurantResponseDto } from '../dto/response/search-restaurant.response.dto';

/** Search Restaurant In Bounds Docs */
export const SearchRestaurantDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 좌표 기반 음식점 키워드 검색 - ( Map > Search )',
      description: [
        '- 사용자 현재 위치 또는 지도 중심 좌표를 기준으로 지정 반경 안에서 음식점을 검색한다. ( 앱에서 사용자 현재 좌표 값 기반으로 좌표를 요청 )',
        '- 가게명 부분일치로 후보를 추리고, 정확일치/전방일치를 우선한 뒤 거리순으로 정렬한다.',
        '- 내부적으로는 반경의 외접 bbox로 후보를 먼저 좁혀 latitude/longitude 인덱스를 활용한다.',
        '- limit 값으로 조회 개수를 제한한다. ( 기본값: 50, 최대: 100 )',
        '- keyword가 비어있거나 공백뿐이면 400을 반환한다.',
        '- 검색 결과가 없을 경우 빈 배열을 반환한다.',
        '- 현재 검색 기록은 백단에서 관리하지 않음',
        '- 프론트 화면: [화면 (Figma)](https://www.figma.com/design/AtU0tCeeJ6GKP0M7X3fFO0/%EB%8B%A4%EC%9D%B4%EB%85%B8%EC%8A%A4-%EA%B0%9C%EB%B0%9C?node-id=201-4049&t=zRtKYhIbdF799Dtl-0)',
      ].join('\n'),
    }),
    ApiOkResponseTemplate({
      description: '지도 영역 키워드 검색 성공',
      type: SearchRestaurantResponseDto,
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
