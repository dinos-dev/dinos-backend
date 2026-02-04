import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { CreateBulkPresignedUrlDto } from 'src/common/dto/create.presigned-url.bulk.dto';
import { CreatePresignedUrlDto } from 'src/common/dto/create.presigned-url.dto';
import { PresignedUrlResponseDto } from 'src/common/dto/presigned-url.response.dto';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { ApiErrorResponseTemplate } from 'src/common/swagger/response/api-error-response';
import { ApiOkResponseTemplate } from 'src/common/swagger/response/api-ok-response';

export const GetPresignedUrlDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '단일 presigned url 발급',
      description: `
      - 단일 presigned url 발급을 요청한다.
      - 발급된 presigned url은 프론트에서 이용 가능하며 PUT 메서드로 해당 PresignedURL에 요청을 보내야 한다. 
      - 요청을 보낼 때, DTO 요청값 (filename, size, mimeType)은 원본 파일과 동일한 정보를 기반으로 요청을 보내야 한다. (요청 받은 이미지의 메타 정보와 불일치할 경우 업로드 실패)
      - 업로드 완료 후 경로값을 백단으로 보내기 위한 cdn url도 함께 발급된다.
      - 발급된 presigned url은 1시간 동안 유효하다.
      `,
    }),
    ApiBody({
      type: CreatePresignedUrlDto,
    }),
    ApiOkResponseTemplate({
      description: 'presigned url 업로드 요청 성공',
      type: PresignedUrlResponseDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.BAD_REQUEST,
        errorFormatList: [HttpErrorConstants.VALIDATE_ERROR],
      },
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
    ]),
  );
};

export const GetBulkPresignedUrlDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '다중 presigned url 발급',
      description: `
      - 다중 presigned url 발급을 요청한다.
      - 최대로 요청 할 수 있는 값은 10개로 제한된다.
      - 요청을 보낼 때, DTO 요청값 (filename, size, mimeType)은 원본 파일과 동일한 정보를 기반으로 요청을 보내야 한다. (요청 받은 이미지의 메타 정보와 불일치할 경우 업로드 실패)
      - 발급된 presigned url은 프론트에서 이용 가능하며, 업로드 완료 후 경로값을 백단으로 보내기 위한 cdn url도 함께 발급된다.
      - 발급된 presigned url은 1시간 동안 유효하다.
      `,
    }),
    ApiBody({
      type: CreateBulkPresignedUrlDto,
    }),
    ApiOkResponseTemplate({
      description: 'presigned url 업로드 요청 성공',
      type: PresignedUrlResponseDto,
      isArray: true,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.BAD_REQUEST,
        errorFormatList: [HttpErrorConstants.VALIDATE_ERROR],
      },
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
    ]),
  );
};
