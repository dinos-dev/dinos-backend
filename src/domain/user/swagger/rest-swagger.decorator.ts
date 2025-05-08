import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { ApiErrorResponseTemplate } from 'src/core/swagger/response/api-error-response';
import { FindOneUserResponseDto } from '../dto/find-user.response.dto';
import { ApiOkResponseTemplate } from 'src/core/swagger/response/api-ok-response';

/**회원탈퇴*/
export const WithdrawUserDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '회원탈퇴',
      description: `
        - 유저를 회원탈퇴 시킨다. 
        - 유저와 연관된 데이터를 모두 제거한다. 
        `,
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

/**단일조회*/
export const FindByIdDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '단일 유저 조회 ',
      description: `
        - accessToken 값으로 유저 정보를 단일로 조회한다.
        `,
    }),
    ApiOkResponseTemplate({
      description: '유저 단일 조회 성공',
      type: FindOneUserResponseDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
      {
        status: StatusCodes.NOT_FOUND,
        errorFormatList: [HttpErrorConstants.NOT_FOUND_USER],
      },
    ]),
  );
};
