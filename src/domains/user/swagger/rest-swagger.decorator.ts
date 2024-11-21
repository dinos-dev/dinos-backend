import { applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { ApiErrorResponseTemplate } from 'src/core/swagger/api-error-response';

/**회원탈퇴*/
export const WithdrawUserDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '회원탈퇴',
      description: `
        - softDelete로 회원을 탈퇴시킨다.
        - 탈퇴된 회원의 정보는 모두 제거하지 않고, 특정 기간 보유시킨다.
        `,
    }),
    ApiHeader({
      name: 'authorization',
      description: 'access token in Bearer format',
      required: true,
    }),
    ApiNoContentResponse({
      description: '회원탈퇴 성공',
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
    ]),
  );
};
