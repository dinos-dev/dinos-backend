import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTimeInterceptor } from './common/interceptor/response-time.interceptor';
import { CommonModule } from './common/common.module';

import { TraceModule } from './infrastructure/logger/trace.module';
import { SentryModule } from '@sentry/nestjs/setup';
import { SlackModule } from './infrastructure/slack/slack.module';
import { SlackErrorFilter } from './common/filter/slack-error.filter';
import { envVariableKeys } from './common/config/env-keys.const';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/presentation/guard/jwt-auth.guard';
import { FeedModule } from './feed/feed.module';
import { MongoDatabaseModule } from './infrastructure/database/mongoose/mongoose.module';
import { ClsModule } from './infrastructure/cls/cls.module';
import { FriendshipModule } from './friendship/friendship.module';
import { EventModule } from './infrastructure/event/event.module';
import { BookmarkModule } from './bookmark/bookmark.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validationSchema: envVariableKeys,
      validationOptions: {
        abortEarly: false,
      },
    }),
    MongoDatabaseModule,
    SentryModule.forRoot(),
    TraceModule,
    UserModule,
    AuthModule,
    CommonModule,
    SlackModule,
    FeedModule,
    FriendshipModule,
    ClsModule,
    EventModule,
    BookmarkModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: SlackErrorFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
