/**
 * ENV 에서 관리하는 정보들을 관리하는 파일
 */

export const ENV_CONFIG = {
  DB: {
    HOST: 'DB_HOST',
    PORT: 'DB_PORT',
    USER: 'DB_USER',
    PASSWORD: 'DB_PASSWORD',
    DATABASE: 'DB_DATABASE',
  },
  AWS: {
    S3_PATH: 'S3_PATH',
    S3_AC_KEY: 'S3_AC_KEY',
    S3_SC_KEY: 'S3_SC_KEY',
    REGION: 'REGION',
    BUKET_NAME: 'BUCKET',
  },
  AUTH: {
    HASH_ROUNDS: 'HASH_ROUNDS',
    EXPOSE_ACCESS_TK: 'EXPOSE_ACCESS_TK',
    EXPOSE_REFRESH_TK: 'EXPOSE_REFRESH_TK',
    ACCESS_SECRET: 'ACCESS_SECRET',
    REFRESH_SECRET: 'REFRESH_SECRET',
  },
};
