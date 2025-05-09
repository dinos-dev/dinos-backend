import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { ApiErrorResponseTemplate } from 'src/core/swagger/response/api-error-response';
import { CreatePresignedUrlDto } from '../dto/create.presigned-url.dto';

/**Presigned-URL 발급*/
export const CreatePresignedUrlDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Presigned-URL 발급',
      description: `
          - Presigned-URL을 발급한다.
          - Presigned-URL의 유효기간은 300초로 지정(300초 이후 만료)
          - 요청 Body에 들어가는 값 (filename, size, mimeType)은 프론트에서 추출후 요청
          `,
    }),
    ApiHeader({
      name: 'authorization',
      description: 'access token in Bearer format',
      required: true,
    }),
    ApiBody({
      type: CreatePresignedUrlDto,
    }),
    ApiCreatedResponse({
      description: 'Presigned-URL 발급 성공',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 201 },
          message: { type: 'string', example: 'Created' },
          result: { type: 'string', example: 'https://test.xxxx.xxxxx/public/temp/slfmisler~~' },
        },
      },
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
    ]),
  );
};
