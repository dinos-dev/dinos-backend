import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { ApiCreatedResponseTemplate } from 'src/common/swagger/response/api-created-response';
import { ApiErrorResponseTemplate } from 'src/common/swagger/response/api-error-response';
import { TogglePinDto } from '../dto/request/toggle-pin.request.dto';
import { PinResponseDto } from '../dto/response/pin.response.dto';

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
