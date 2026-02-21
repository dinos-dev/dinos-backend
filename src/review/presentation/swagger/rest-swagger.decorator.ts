import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { CreateBulkPresignedUrlDto } from 'src/common/dto/create.presigned-url.bulk.dto';
import { CreatePresignedUrlDto } from 'src/common/dto/create.presigned-url.dto';
import { PresignedUrlResponseDto } from 'src/common/dto/presigned-url.response.dto';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { ApiErrorResponseTemplate } from 'src/common/swagger/response/api-error-response';
import { ApiOkResponseTemplate } from 'src/common/swagger/response/api-ok-response';
import { ApiCreatedResponseTemplate } from 'src/common/swagger/response/api-created-response';
import { CreateReviewQuestionDto } from '../dto/request/create-review-question.dto';
import { CreateReviewQuestionsBulkDto } from '../dto/request/create-review-questions-bulk.dto';
import { ReviewQuestionResponseDto } from '../dto/response/review-question.response.dto';
import { ReviewQuestionsBulkResponseDto } from '../dto/response/review-questions-bulk.response.dto';
import { ReviewFormQuestionsResponseDto } from '../dto/response/review-form-questions.response.dto';
import { CreateReviewDto } from '../dto/request/create-review.dto';
import { CreateReviewResponseDto } from '../dto/response/create-review.response.dto';
import { CursorPaginatedResponseDto } from 'src/common/dto/pagination.dto';
import { MyReviewResponseDto } from '../dto/response/my-reviews.response.dto';

//? 리뷰 작성문서
export const CreateReviewDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '리뷰 작성',
      description: `
      - 가게에 대한 리뷰를 작성한다.
      - 가게 정보(name, address)를 기반으로 자동 upsert 처리된다. (Naver Place 기반)
      - answers는 선택사항이며, 각 항목은 optionId 또는 customAnswer 중 하나만 입력해야 한다.
      - reviews/questions 에서 반환된 Questions의 id는 모두 포함시켜야 한다. (추후 리뷰를 수정하는 케이스에서 해당 질문지를 그대로 보여주어야 하기 때문)
      - images는 선택사항이며, 첨부 시 isPrimary: true 항목이 반드시 1개여야 한다.
      `,
    }),
    ApiBody({ type: CreateReviewDto }),
    ApiCreatedResponseTemplate({
      description: '리뷰 작성 성공',
      type: CreateReviewResponseDto,
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

//? 내가 작성한 리뷰 목록 조회문서
export const GetMyReviewsDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '내가 작성한 리뷰 목록 조회',
      description: `
      - 사용자가 작성한 리뷰 목록을 최신순으로 반환한다.
      - 커서 기반 페이징(30개)으로 동작한다.
      - 첫 요청 시 cursor 파라미터를 생략한다.
      - 응답의 nextCursor 값을 다음 요청의 cursor 파라미터로 전달하면 다음 페이지를 조회할 수 있다.
      - hasNext가 false이면 마지막 페이지이다.
      - 각 리뷰에는 가게 이름/주소, 답변(질문 텍스트 포함), 이미지 목록이 포함된다.
      `,
    }),
    ApiOkResponseTemplate({
      description: '내 리뷰 목록 조회 성공',
      type: CursorPaginatedResponseDto<MyReviewResponseDto>,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
    ]),
  );
};

export const GetReviewFormQuestionsDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '리뷰 폼 질문 조회',
      description: `
      - 리뷰 작성 시 각 단계(step)에 표시할 질문을 반환한다.
      - 총 5단계(BEFORE_ENTRY, ENTRY, ORDER, MEAL, WRAP_UP)에 대해 각 1개씩 랜덤으로 선택된다.
      - 특정 단계에 활성화된 질문이 없을 경우 해당 step의 question은 null로 반환된다 ( 해당 부분은 관리자단에서 잘 못 리소스를 삽입한 부분이기 때문에 임시 처리용으로 처리 )
      `,
    }),
    ApiOkResponseTemplate({
      description: '리뷰 폼 질문 조회 성공',
      type: ReviewFormQuestionsResponseDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
    ]),
  );
};

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

export const CreateReviewQuestionDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '리뷰 질문 생성 (관리자용)',
      description: `
      - 리뷰 질문을 생성한다.
      - 질문과 선택지를 함께 생성한다.
      - step은 BEFORE_ENTRY, ENTRY, ORDER, MEAL, WRAP_UP 중 하나를 선택한다.
      `,
    }),
    ApiBody({
      type: CreateReviewQuestionDto,
    }),
    ApiCreatedResponseTemplate({
      description: '리뷰 질문 생성 성공',
      type: ReviewQuestionResponseDto,
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

export const CreateReviewQuestionsBulkDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '리뷰 질문 일괄 생성 (관리자용)',
      description: `
      - 여러 리뷰의 질문 리스트를 한 번에 생성한다.
      - 각 질문과 선택지를 함께 생성한다.
      - 개수 제한 없이 원하는 만큼 질문을 생성할 수 있다.
      `,
    }),
    ApiBody({
      type: CreateReviewQuestionsBulkDto,
    }),
    ApiCreatedResponseTemplate({
      description: '리뷰 질문 일괄 생성 성공',
      type: ReviewQuestionsBulkResponseDto,
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
