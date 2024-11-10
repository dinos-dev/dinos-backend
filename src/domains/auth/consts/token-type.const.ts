/** Token Type */
export const AuthTokenType = Object.freeze({
  ACCESS_TOKEN: 'at',
  REFRESH_TOKEN: 'rt',
} as const);

type AuthTokenType = (typeof AuthTokenType)[keyof typeof AuthTokenType];
