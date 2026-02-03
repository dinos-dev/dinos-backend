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
      summary: '핀 생성 또는 제거 ( toggle )',
      description: `
      - 핀을 생성 또는 제거 ( toggle ) 한다.
      - 핀이 존재할 경우 제거하고, 존재하지 않을 경우 생성한다.
      - 본인이 가고자 하는 PLANNED 타입의 핀을 생성한다. 
      - VISITED 유형의 핀은 해당 API로 생성되는 것이 아니라, Review 생성시 자동으로 해당 pin의 type이 VISITED로 UPSERT 된다.
      `,
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
    ]),
  );
};

/**Nearby Pins Docs*/
export const NearbyPinsDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '주변 핀 조회',
      description: `
      - 사용자 디바이스의 위치 정보 (위도&경도) 값을 기준으로 본인이 pin 한 음식점 리스트를 일괄로 조회한다. 
      - 프론트엔드에서는 요청을 보낼 때, min & max 위도 경도 값을 함께 보내주어야 한다 
        - 여기서 말하는 min & max 위도 경도 값은 프론트엔드의 화면 비율의 최소 위도 경도 값과 최대 위도 경도 값을 의미한다 ( Naver Map 기준 )
      - limit 값을 통해 조회할 핀의 개수를 제한할 수 있다. ( 기본값: 50, 최대: 1000 )
      - type 값을 통해 조회할 핀의 타입별로 필터링 할 수 있다. type을 전달하지 않을 경우, 모든 타입의 핀을 조회한다. 
      - 사용자가 핀한 리스트가 없을 경우 빈 배열을 반환한다. 
      `,
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
