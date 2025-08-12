/**
 * Feed 도메인에서 사용하는 http error response 객체
 */

import { HttpStatus } from '@nestjs/common';
import { HttpErrorFormat } from 'src/common/http/http-error-objects';

export const HttpFeedErrorConstants = {
  NOT_FOUND_FEED_BY_ID: {
    status: HttpStatus.NOT_FOUND,
    error: 'NOT_FOUND_FEED_BY_ID',
    message: 'ID 값이 잘못 되었거나, 존재하지 않아 피드를 찾을 수 없습니다.',
  } as HttpErrorFormat,
};
