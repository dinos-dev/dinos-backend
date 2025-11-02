import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { ToggleBookmarkDto } from '../dto/request/toggle.bookmark.dto';
import { ApiOkResponseTemplate } from 'src/common/swagger/response/api-ok-response';
import { ResponseToggleBookmarkDto } from '../dto/response/response.toggle.bookmark.dto';
import { ApiErrorResponseTemplate } from 'src/common/swagger/response/api-error-response';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';

/** 북마크 생성 또는 제거 */
export const ToggleBookmarkDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '북마크 생성 또는 제거 ( toggle )',
      description: `북마크를 생성 또는 제거 ( toggle ) 한다.
      - 북마크가 존재할 경우 제거하고, 존재하지 않을 경우 생성한다.
      - 북마크 조회 시, 북마크 존재 여부를 확인하고, 존재할 경우 제거하고, 존재하지 않을 경우 생성한다.
      `,
    }),
    ApiBody({
      type: ToggleBookmarkDto,
    }),
    ApiOkResponseTemplate({
      description: '북마크 생성 또는 제거 성공',
      type: ResponseToggleBookmarkDto,
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
