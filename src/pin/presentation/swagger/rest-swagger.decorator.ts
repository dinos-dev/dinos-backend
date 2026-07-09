import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { ApiCreatedResponseTemplate } from 'src/common/swagger/response/api-created-response';
import { ApiErrorResponseTemplate } from 'src/common/swagger/response/api-error-response';
import { TogglePinDto } from '../dto/request/toggle-pin.request.dto';
import { PinResponseDto } from '../dto/response/pin.response.dto';
import { ApiOkResponseTemplate } from 'src/common/swagger/response/api-ok-response';
import { NearbyPinResponseDto } from '../dto/response/nearby-pins.response.dto';

/**Toggle Pin Docs*/
export const TogglePinDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '핀 생성 또는 제거 ( Map > 핀 토글 ) ',
      description: [
        '- 핀을 생성 또는 제거 ( toggle ) 한다.',
        '- 요청 바디로 자체 검색 API가 반환한 restaurantId를 전달한다. (가게 정보 upsert 로직 제거됨)',
        '- 핀이 존재할 경우 제거하고, 존재하지 않을 경우 생성한다.',
        '- 존재하지 않는 restaurantId면 404를 반환한다.',
      ].join('\n'),
    }),
    ApiBody({
      type: TogglePinDto,
    }),
    ApiCreatedResponseTemplate({
      description: '핀 생성 또는 제거 ( toggle ) 성공',
      type: PinResponseDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.BAD_REQUEST,
        errorFormatList: [HttpErrorConstants.VALIDATE_ERROR],
      },
      {
        status: StatusCodes.NOT_FOUND,
        errorFormatList: [HttpErrorConstants.NOT_FOUND_RESTAURANT],
      },
    ]),
  );
};

/**Nearby Pins Docs*/
export const NearbyPinsDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '주변 내가 핀한 가게 조회 ( MAP > 핀 )',
      description: [
        '- 사용자 디바이스의 위치 정보 (위도&경도) 값을 기준으로 본인이 pin 한 음식점 리스트를 일괄로 조회한다.',
        '- 프론트엔드에서는 요청을 보낼 때, min & max 위도 경도 값을 함께 보내주어야 한다.',
        '- 여기서 말하는 min & max 위도 경도 값은 프론트엔드의 화면 비율의 최소/최대 위도 경도 값을 의미한다. ( Naver Map 기준 )',
        '- limit 값을 통해 조회할 핀의 개수를 제한할 수 있다. ( 기본값: 50, 최대: 1000 )',
        '- 프론트 화면: [Map / Search 화면 (Figma)](https://figma.com/file/xxx?node-id=123)',
      ].join('\n'),
    }),
    ApiOkResponseTemplate({
      description: '주변 핀 조회 성공',
      type: NearbyPinResponseDto,
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
