import * as Joi from 'joi';

export const envVariableKeys = Joi.object({
  // DB 관련 환경 변수
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_URL: Joi.string().uri().required(),

  // AWS S3 관련 환경 변수
  S3_ACCESS_KEY_ID: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
  REGION: Joi.string().required(),
  BUCKET_NAME: Joi.string().required(),

  // 인증 관련 환경 변수
  HASH_ROUNDS: Joi.number().default(10),
  EXPOSE_ACCESS_TK: Joi.string().required(),
  EXPOSE_REFRESH_TK: Joi.string().required(),
  ACCESS_SECRET: Joi.string().required(),
  REFRESH_SECRET: Joi.string().required(),

  // 소셜 인증 관련 환경 변수
  NAVER_AUTH_URL: Joi.string().uri().required(),
  GOOGLE_AUTH_URL: Joi.string().uri().required(),
  APPLE_AUTH_URL: Joi.string().uri().required(),
  APPLE_CLIENT_ID: Joi.string().required(),

  // Slack 관련 환경 변수
  SLACK_WEB_HOOK: Joi.string().uri().required(),
  SLACK_API_TOKEN: Joi.string().required(),
});
