import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import { ApiOkResponseTemplate } from 'src/common/swagger/response/api-ok-response';
import { HomeFeedResponseDto } from '../dto/response/home-feed.response.dto';
import { FeedResponseDto } from '../dto/response/feed.response.dto';
import { ApiErrorResponseTemplate } from 'src/common/swagger/response/api-error-response';
import { StatusCodes } from 'http-status-codes';
import { HttpFeedErrorConstants } from 'src/feed/application/helper/http-error-object';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';

//? Find All Home Feed
export const FindAllFeedDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: `전체 홈 피드의 Documents 리스트 조회`,
      description: `
          - 전체 홈 피드에 대한 MongoDB의 Documents 리스트를 조회한다.
          - 실제 Application 개발이 아닌 추후, Admin 환경에서 적용된다.
          - Public API로 설정되어 있어, 인증 없이 접근 가능하다.
          `,
    }),
    ApiOkResponseTemplate({
      description: '전체 홈 피드 조회 성공',
      type: FeedResponseDto,
    }),
  );
};

//? Find By Home Feed
export const FindByHomeFeedDocs = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: `홈 피드 조회`,
      description: `
          - 크롤링된 InputKeyWord 기반 AI로 생성된 홈 피드를 조회한다.
          - 실제 배포되는 Application Home Feeds 메인에서 조회되는 리스트다.
          `,
    }),
    ApiOkResponseTemplate({
      description: '홈 피드 조회 성공',
      type: HomeFeedResponseDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
    ]),
  );
};

//? FindById Feed
export const FindByIdFeedDocs = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: `ID 기반 피드 상세 조회`,
      description: `
          - ID를 기반으로 피드의 상세 정보를 조회한다.
          - 만약, 해당 ID로 피드를 찾을 수 없는 경우, NotFoundException이 발생한다.
          `,
    }),
    ApiParam({
      name: 'id',
      description: '피드 ID',
      example: '689afce88be111d472e83f75',
      required: true,
      type: String,
    }),
    ApiOkResponseTemplate({
      description: '피드 상세 조회 성공',
      type: FeedResponseDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
      {
        status: StatusCodes.NOT_FOUND,
        errorFormatList: [HttpFeedErrorConstants.NOT_FOUND_FEED_BY_ID],
      },
    ]),
  );
};
