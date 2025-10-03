/**
 * User 도메인에서 사용하는 http error response 객체
 */

import { HttpStatus } from '@nestjs/common';
import { HttpErrorFormat } from 'src/common/http/http-error-objects';

export const HttpFriendshipErrorConstants = {
  NOT_FOUND_USER: {
    status: HttpStatus.NOT_FOUND,
    error: 'NOT_FOUND_USER',
    message: '해당 유저를 찾을 수 없습니다.',
  } as HttpErrorFormat,

  SAME_USER_ID: {
    status: HttpStatus.BAD_REQUEST,
    error: 'SAME_USER_ID',
    message: '본인에게 친구 요청을 할 수 없습니다.',
  } as HttpErrorFormat,
};
