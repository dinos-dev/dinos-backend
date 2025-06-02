import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmConfig } from './database/orm-config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserModule } from './domain/user/user.module';
import { AuthModule } from './domain/auth/auth.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTimeInterceptor } from './core/interceptor/response-time.interceptor';
import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './domain/auth/guard/jwt-auth.guard';
import { TraceModule } from './core/logger/trace.module';
import { SentryModule } from '@sentry/nestjs/setup';
import { SlackModule } from './infrastructure/slack/slack.module';
import { SlackErrorFilter } from './core/filter/slack-error.filter';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: OrmConfig,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.development' : '.env.production',
    }),
    SentryModule.forRoot(),
    TraceModule,
    UserModule,
    AuthModule,
    CommonModule,
    SlackModule,
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
