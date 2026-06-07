import { ClassSerializerInterceptor, INestApplication, Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execFileSync } from 'child_process';
import { AppModule } from '../../../src/app.module';
import { HttpResponseInterceptor } from '../../../src/common/interceptor/http-response.interceptor';
import { createGlobalValidationPipe } from '../../../src/common/pipe/validation-pipe.config';
import { FeedModule } from '../../../src/feed/feed.module';
import { MongoDatabaseModule } from '../../../src/infrastructure/database/mongoose/mongoose.module';
import { PrismaService } from '../../../src/infrastructure/database/prisma/prisma.service';
import { WinstonLoggerService } from '../../../src/infrastructure/logger/winston-logger.service';
import { SlackService } from '../../../src/infrastructure/slack/slack.service';
import { request } from './supertest';

@Module({})
class NoopMongoDatabaseModule {}

@Module({})
class NoopFeedModule {}

export interface E2eTestApp {
  app: INestApplication;
  prisma: PrismaService;
  stop: () => Promise<void>;
}

export async function createE2eTestApp(): Promise<E2eTestApp> {
  const postgres = await new PostgreSqlContainer('postgres:16.3-alpine')
    .withDatabase('dinos_e2e')
    .withUsername('dinos')
    .withPassword('dinos')
    .start();

  const dbUrl = postgres.getConnectionUri();
  setTestEnv(dbUrl);
  migrate(dbUrl);

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideModule(MongoDatabaseModule)
    .useModule(NoopMongoDatabaseModule)
    .overrideModule(FeedModule)
    .useModule(NoopFeedModule)
    .overrideProvider(SlackService)
    .useValue({
      sendMessage: async () => undefined,
      sendErrorNotification: async () => undefined,
    })
    .overrideProvider(WinstonLoggerService)
    .useValue({
      log: () => undefined,
      error: () => undefined,
      warn: () => undefined,
      debug: () => undefined,
      verbose: () => undefined,
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector), {}));
  app.useGlobalInterceptors(new HttpResponseInterceptor());
  app.useGlobalPipes(createGlobalValidationPipe());

  await app.init();

  const prisma = app.get(PrismaService);

  return {
    app,
    prisma,
    stop: async () => {
      await app.close();
      await postgres.stop();
    },
  };
}

export async function resetRelationalDb(prisma: PrismaService): Promise<void> {
  await prisma.recommendationResult.deleteMany();
  await prisma.reviewAnswer.deleteMany();
  await prisma.reviewImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reviewQuestionOption.deleteMany();
  await prisma.reviewQuestion.deleteMany();
  await prisma.friendshipActivity.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.friendRequest.deleteMany();
  await prisma.pin.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.token.deleteMany();
  await prisma.inviteCode.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
}

export async function registerLocalUser(
  app: INestApplication,
  email = 'e2e-user@example.com',
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await request(app.getHttpServer())
    .post('/auth/local')
    .set('user-agent', 'jest-e2e')
    .send({
      email,
      name: 'E2E User',
      password: 'test1234!',
    })
    .expect(201);

  return response.body.result;
}

function migrate(dbUrl: string): void {
  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DB_URL: dbUrl,
    },
    stdio: 'pipe',
  });
}

function setTestEnv(dbUrl: string): void {
  Object.assign(process.env, {
    NODE_ENV: 'test',
    DB_HOST: 'localhost',
    DB_PORT: String(new URL(dbUrl).port),
    DB_USER: 'dinos',
    DB_PASSWORD: 'dinos',
    DB_DATABASE: 'dinos_e2e',
    DB_URL: dbUrl,
    MONGO_URL: 'mongodb://localhost:27017/dinos_e2e',
    S3_ACCESS_KEY_ID: 'test',
    S3_SECRET_KEY: 'test',
    REGION: 'ap-northeast-2',
    BUCKET_NAME: 'test',
    R2_ACCOUNT_ID: 'test',
    R2_ACCESS_KEY: 'test',
    R2_SECRET_KEY: 'test',
    R2_BUCKET_NAME: 'test',
    R2_CDN_URL: 'https://cdn.example.com',
    HASH_ROUNDS: '10',
    EXPOSE_ACCESS_TK: '1h',
    EXPOSE_REFRESH_TK: '7d',
    ACCESS_SECRET: 'test-access-secret',
    REFRESH_SECRET: 'test-refresh-secret',
    NAVER_AUTH_URL: 'https://auth.example.com/naver',
    GOOGLE_AUTH_URL: 'https://auth.example.com/google',
    APPLE_AUTH_URL: 'https://auth.example.com/apple',
    APPLE_CLIENT_ID: 'test.apple.client',
    KAKAO_AUTH_URL: 'https://auth.example.com/kakao',
    SLACK_WEB_HOOK: 'https://hooks.slack.com/services/test',
    SLACK_API_TOKEN: 'test',
    PORT: '0',
    ADMIN_API_KEY: 'test-admin-api-key',
  });
}
