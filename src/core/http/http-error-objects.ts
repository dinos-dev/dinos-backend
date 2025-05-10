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

  INVALID_PASSWORD_REGEX: {
    error: 'INVALID_PASSWORD_REGEX',
    message: '패스워드 양식이 올바르지 않습니다.',
  } as HttpErrorFormat,

  UNAUTHORIZED_USER: {
    error: 'UNAUTHORIZED_USER',
    message: '아이디 또는 비밀번호가 잘못 되었습니다.',
  } as HttpErrorFormat,

  FORBIDDEN: {
    error: 'FORBIDDEN',
    message: '권한이 없습니다.',
  } as HttpErrorFormat,

  INTERNAL_SERVER_ERROR: {
    error: 'INTERNAL_SERVER_ERROR',
    message: '알 수 없는 오류가 발생하였습니다.',
  } as HttpErrorFormat,

  INTERNAL_DATABASE_ERROR: {
    error: 'INTERNAL_DATABASE_ERROR',
    message: '트랜잭션 수행중 에러가 발생하였습니다.',
  } as HttpErrorFormat,

  EXIST_INFO: {
    error: 'EXIST_INFO',
    message: '가입된 정보가 존재합니다.',
  } as HttpErrorFormat,

  EXIST_EMAIL: {
    error: 'EXIST_EMAIL',
    message: '이미 가입된 이메일 정보가 존재합니다.',
  } as HttpErrorFormat,

  EXIST_LOCAL_ACCOUNT: {
    error: 'EXIST_LOCAL_ACCOUNT',
    message: '가입된 이메일이 존재합니다.',
  } as HttpErrorFormat,

  EXIST_NAVER_ACCOUNT: {
    error: 'EXIST_NAVER_ACCOUNT',
    message: '가입된 네이버 계정이 존재합니다.',
  } as HttpErrorFormat,

  EXIST_GOOGLE_ACCOUNT: {
    error: 'EXIST_GOOGLE_ACCOUNT',
    message: '가입된 구글 계정이 존재합니다.',
  } as HttpErrorFormat,

  EXIST_APPLE_ACCOUNT: {
    error: 'EXIST_APPLE_ACCOUNT',
    message: '가입된 애플 계정이 존재합니다.',
  } as HttpErrorFormat,

  EXIST_KAKAO_ACCOUNT: {
    error: 'EXIST_KAKAO_ACCOUNT',
    message: '가입된 카카오 계정이 존재합니다.',
  } as HttpErrorFormat,

  VALIDATE_ERROR: {
    error: 'VALIDATE_ERROR',
    message: '입력값이 유효하지 않습니다. 다시 확인해주세요.',
  } as HttpErrorFormat,

  NOT_MATCHED: {
    error: 'NOT_MATCHED',
    message: '요청 코드와 일치하지 않습니다.',
  } as HttpErrorFormat,

  INVALID_AUTH: {
    error: 'UNAUTHORIZED',
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
  } as HttpErrorFormat,

  INVALID_TOKEN: {
    error: 'INVALID_TOKEN',
    message: '토큰 검증 실패',
  } as HttpErrorFormat,

  INVALID_TOKEN_FORMAT: {
    error: 'INVALID_TOKEN_FORMAT',
    message: '토큰 포맷이 일치하지 않습니다.',
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

  UNAUTHORIZED_INVALID_SIGNATURE: {
    error: 'UNAUTHORIZED_INVALID_SIGNATURE',
    message: '토큰의 시그니처가 불일치 합니다.',
  } as HttpErrorFormat,

  NOT_FOUND_TOKEN: {
    error: 'NOT_FOUND_TOKEN',
    message: '토큰을 찾을 수 없습니다.',
  } as HttpErrorFormat,

  INVALID_BEARER_TOKEN: {
    error: 'INVALID_BEARER_TOKEN',
    message: '잘못된 토큰 타입입니다.',
  } as HttpErrorFormat,

  NOT_COLLETED_ACCESS_TYPE: {
    error: 'NOT_COLLETED_ACCESS_TYPE',
    message: '엑세스 토큰이 아닙니다.',
  } as HttpErrorFormat,

  TIMEOUT_EXCEPTION: {
    error: 'TIMEOUT_EXCEPTION',
    message: '요청에 대한 응답시간이 초과되었습니다.',
  } as HttpErrorFormat,

  NOT_COLLETED_REFRESH_TYPE: {
    error: 'NOT_COLLETED_REFRESH_TYPE',
    message: '리프레시 토큰이 아닙니다.',
  } as HttpErrorFormat,

  NOT_FOUND_USER: {
    error: 'NOT_FOUND_USER',
    message: '사용자를 찾을수 없습니다.',
  } as HttpErrorFormat,

  NOT_REGISTER_USER: {
    error: 'NOT_REGISTER_USER',
    message: '가입된 유저가 아닙니다.',
  } as HttpErrorFormat,

  SOCIAL_TOKEN_REQUIRED: {
    error: 'SOCIAL_TOKEN_REQUIRED',
    message: '소셜 토큰이 필요합니다.',
  } as HttpErrorFormat,

  SOCIAL_TOKEN_INTERNAL_SERVER_ERROR: {
    error: 'SOCIAL_TOKEN_INTERNAL_SERVER_ERROR',
    message: '소셜 토큰 검증중 에러가 발생하였습니다.',
  } as HttpErrorFormat,

  NOT_BE_EMPTY: 'not be empty',

  ERR_INVALID_PARAMS: '잘못된 파라미터 입니다.',

  ERROR_INVALID_PARAMS: {
    error: 'ERR_INVALID_PARAMS',
    message: '잘못된 파라미터 입니다.',
  } as HttpErrorFormat,

  COMMON_UNAUTHORIZED_TOKEN_ERROR: [] as HttpErrorFormat[], // 공통(Bearer Access Token Error Template)
};

HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR = [
  HttpErrorConstants.NOT_FOUND_TOKEN,
  HttpErrorConstants.INVALID_TOKEN,
  HttpErrorConstants.EXPIRED_TOKEN,
  HttpErrorConstants.INVALID_TOKEN_FORMAT,
  HttpErrorConstants.UNAUTHORIZED_INVALID_SIGNATURE,
];
