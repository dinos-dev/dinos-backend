import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTimeInterceptor } from './common/interceptor/response-time.interceptor';
import { CommonModule } from './common/common.module';

import { TraceModule } from './infrastructure/logger/trace.module';
import { SentryModule } from '@sentry/nestjs/setup';
import { SlackModule } from './infrastructure/slack/slack.module';
import { R2Module } from './infrastructure/r2/r2.module';
import { SlackErrorFilter } from './common/filter/slack-error.filter';
import { envVariableKeys } from './common/config/env-keys.const';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/presentation/guard/jwt-auth.guard';
// NOTE: 하이브리드 feed(MongoDB)는 현 단계 미사용으로 IoC 미주입(보류).
//       코드/스키마는 보존되어 있으며, 재사용 시 아래 두 모듈을 imports에 다시 등록하면 됨.
// import { FeedModule } from './feed/feed.module';
// import { MongoDatabaseModule } from './infrastructure/database/mongoose/mongoose.module';
import { ClsModule } from './infrastructure/cls/cls.module';
import { FriendshipModule } from './friendship/friendship.module';
import { EventModule } from './infrastructure/event/event.module';
// NOTE: bookmark 도메인 Deprecated - 현 단계 미사용으로 IoC 미주입(보류).
//       코드는 보존되어 있으며, 재사용 시 아래 모듈을 imports에 다시 등록하면 됨.
// import { BookmarkModule } from './bookmark/bookmark.module';
import { HealthModule } from './health/health.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { ReviewModule } from './review/review.module';
import { PinModule } from './pin/pin.module';
import { RecommendationModule } from './recommendation/recommendation.module';

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
    // MongoDatabaseModule, // 미사용 feed 도메인 전용 커넥션 - 보류
    SentryModule.forRoot(),
    TraceModule,
    UserModule,
    AuthModule,
    CommonModule,
    SlackModule,
    R2Module,
    // FeedModule, // 하이브리드 feed 미사용 - 보류
    FriendshipModule,
    ClsModule,
    EventModule,
    // BookmarkModule, // Deprecated 미사용 - 보류
    HealthModule,
    RestaurantModule,
    ReviewModule,
    PinModule,
    RecommendationModule,
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
