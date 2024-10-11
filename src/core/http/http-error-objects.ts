/**
 * HTTP error code 관련 상수
 */

export interface HttpErrorFormat {
  error: string;
  description?: string;
  message: string;
}

export const HttpErrorConstants = {
  UNAUTHORIZED: {
    error: 'UNAUTHORIZED',
    message: '로그인이 필요합니다.',
  } as HttpErrorFormat,

  FORBIDDEN: {
    error: 'FORBIDDEN',
    message: '권한이 없습니다.',
  } as HttpErrorFormat,

  INTERNAL_SERVER_ERROR: {
    error: 'INTERNAL_SERVER_ERROR',
    message: '알 수 없는 오류가 발생하였습니다.',
  } as HttpErrorFormat,

  EXIST_INFO: {
    error: 'EXIST_INFO',
    message: '가입된 정보가 존재합니다.',
  } as HttpErrorFormat,

  EXIST_ID: {
    error: 'EXIST_ID',
    message: '이미 가입된 아이디 입니다.',
  } as HttpErrorFormat,

  EXIST_DATA: {
    error: 'EXIST_DATA',
    message: '해당 정보가 이미 존재합니다.',
  } as HttpErrorFormat,

  FILE_SIZE_LIMIT_EXCEEDED: {
    error: 'FILE_SIZE_LIMIT_EXCEEDED',
    message: '업로드 하는 파일의 사이즈가 너무 큽니다.',
  } as HttpErrorFormat,

  INVALID_FILE_TYPE: {
    error: 'INVALID_FILE_TYPE',
    message: '파일의 규격이 다릅니다.',
  } as HttpErrorFormat,

  VALIDATE_ERROR: {
    error: 'VALIDATE_ERROR',
    message:
      '입력 형식이 올바르지 않거나, 일치하지 않습니다. 다시 확인해주세요.',
  } as HttpErrorFormat,

  NOT_MACHTED: {
    error: 'NOT_MACHTED',
    message: '요청 코드와 일치하지 않습니다.',
  } as HttpErrorFormat,

  INVALID_AUTH: {
    error: 'UNAUTHORIZED',
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
  } as HttpErrorFormat,

  INVALID_PASSWORD: {
    error: 'INVALID_PASSWORD',
    message: '비밀번호가 올바르지 않습니다. ',
  } as HttpErrorFormat,

  INVALID_TOKEN: {
    error: 'UNAUTHORIZED',
    message: '잘못된 토큰값 입니다.',
  } as HttpErrorFormat,

  CANNOT_FIND_USER: {
    error: 'CANNOT_FIND_USER',
    message: '유저를 찾을 수 없습니다.',
  } as HttpErrorFormat,

  EXPIRED_ACCESS_TOKEN: {
    error: 'EXPIRED_ACCESS_TOKEN',
    message: '액세스 토큰이 만료되었습니다.',
  } as HttpErrorFormat,

  EXPIRED_REFRESH_TOKEN: {
    error: 'EXPIRED_REFRESH_TOKEN',
    message: '리프레시 토큰이 만료되었습니다. 다시 로그인이 필요합니다.',
  },

  EXPIRED_TOKEN: {
    error: 'EXPIRED_TOKEN',
    message: '토큰이 만료되었습니다.',
  } as HttpErrorFormat,

  FORBIDDEN_TOKEN: {
    error: 'FORBIDDEN_TOKEN',
    message: '토큰의 시그니처가 불일치 합니다.',
  } as HttpErrorFormat,

  NOT_FOUND_TOKEN: {
    error: 'NOT_FOUND_TOKEN',
    message: '토큰을 찾을 수 없습니다.',
  } as HttpErrorFormat,

  INVALID_BEARER_TOKEN: {
    error: 'INVALID_BEARER_TOKEN',
    message: '토큰의 타입이 Bearer 유형이 아닙니다.',
  } as HttpErrorFormat,

  NOT_COLLETED_ACCESS_TYPE: {
    error: 'NOT_COLLETED_ACCESS_TYPE',
    message: '엑세스 토큰이 아닙니다.',
  } as HttpErrorFormat,

  NOT_COLLETED_REFRESH_TYPE: {
    error: 'NOT_COLLETED_REFRESH_TYPE',
    message: '리프레시 토큰이 아닙니다.',
  } as HttpErrorFormat,

  NOT_FOUND_USER: {
    error: 'NOT_FOUND_USER',
    message: '토큰에 지정된 유저가 존재하지 않습니다.',
  } as HttpErrorFormat,

  NOT_REGISTER_USER: {
    error: 'NOT_REGISTER_USER',
    message: '가입된 유저가 아닙니다.',
  } as HttpErrorFormat,
};
