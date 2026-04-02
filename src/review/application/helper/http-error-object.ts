/**
 * Review 도메인에서 사용하는 http error response 객체
 */

import { HttpStatus } from '@nestjs/common';
import { HttpErrorFormat } from 'src/common/http/http-error-objects';

export const HttpReviewErrorConstants = {
  WRAP_UP_ANSWER_REQUIRED: {
    status: HttpStatus.BAD_REQUEST,
    error: 'WRAP_UP_ANSWER_REQUIRED',
    message: '마무리(WRAP_UP) 단계 답변은 필수입니다.',
  } as HttpErrorFormat,
};
