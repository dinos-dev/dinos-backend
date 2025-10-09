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

  INVALID_FRIEND_REQUEST_RECEIVER: {
    status: HttpStatus.FORBIDDEN,
    error: 'INVALID_FRIEND_REQUEST_RECEIVER',
    message: '본인이 받은 친구 요청이 아닙니다.',
  } as HttpErrorFormat,

  NOT_FOUND_FRIEND_REQUEST: {
    status: HttpStatus.NOT_FOUND,
    error: 'NOT_FOUND_FRIEND_REQUEST',
    message: '친구 요청을 찾을 수 없습니다.',
  } as HttpErrorFormat,

  NOT_FOUND_FRIENDSHIP: {
    status: HttpStatus.NOT_FOUND,
    error: 'NOT_FOUND_FRIENDSHIP',
    message: '친구 관계를 찾을 수 없습니다.',
  } as HttpErrorFormat,

  FORBIDDEN_FRIENDSHIP_REMOVAL: {
    status: HttpStatus.FORBIDDEN,
    error: 'FORBIDDEN_FRIENDSHIP_REMOVAL',
    message: '친구 관계를 제거할 권한이 없습니다.',
  } as HttpErrorFormat,
};
