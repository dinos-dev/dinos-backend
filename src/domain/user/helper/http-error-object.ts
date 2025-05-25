/**
 * User 도메인에서 사용하는 http error response 객체
 */

import { HttpErrorFormat } from 'src/core/http/http-error-objects';

export const HttpUserErrorConstants = {
  NOT_FOUND_PROFILE: {
    error: 'NOT_FOUND_PROFILE',
    message: '사용자의 프로필을 찾을 수 없습니다.',
  } as HttpErrorFormat,

  NOT_FOUND_USER: {
    error: 'NOT_FOUND_USER',
    message: '해당 유저를 찾을 수 없습니다.',
  } as HttpErrorFormat,

  CONFLICT_USER_PROFILE: {
    error: 'CONFLICT_USER_PROFILE',
    message: '이미 등록된 프로필이 존재합니다.',
  } as HttpErrorFormat,
};
