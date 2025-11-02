import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ToggleBookmarkDto } from '../dto/request/toggle.bookmark.dto';
import { ApiOkResponseTemplate } from 'src/common/swagger/response/api-ok-response';
import { ResponseToggleBookmarkDto } from '../dto/response/response.toggle.bookmark.dto';
import { ApiErrorResponseTemplate } from 'src/common/swagger/response/api-error-response';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { PaginatedBookmarkResponseDto } from '../dto/response/response.bookmark.dto';
import { ItemType } from '@prisma/client';

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

/** 북마크 필터 조회 */
export const FindFilterBookmarkDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '내가 북마크한 피드 및 음식점 조회 ( 페이징 처리 )',
      description: `내가 북마크한 피드 및 음식점을 조회한다.
      - 페이징 처리를 위해 page와 limit를 받을 수 있고, 기본값은 page=1, limit=20이다.
      - itemType을 통해 피드 및 음식점을 구분한다.
      - 내가 북마크한 데이터가 없을경우 response의 data값이 빈 배열로 리스폰스 된다.
      `,
    }),
    ApiQuery({
      name: 'page',
      type: Number,
      required: false,
      example: 20,
      description: '페이지당 항목 수 (기본값: 20, 최대: 50)',
    }),
    ApiQuery({
      name: 'limit',
      type: Number,
      required: false,
      example: 20,
      description: '페이지당 항목 수 (기본값: 20, 최대: 50)',
    }),
    ApiParam({
      name: 'itemType',
      type: String,
      example: 'FEED',
      required: true,
      description: '북마크 타입 ( FEED, RESTAURANT )',
      enum: ItemType,
    }),
    ApiOkResponseTemplate({
      description: '북마크 필터 조회 성공',
      type: PaginatedBookmarkResponseDto,
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
