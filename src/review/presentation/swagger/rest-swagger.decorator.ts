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
