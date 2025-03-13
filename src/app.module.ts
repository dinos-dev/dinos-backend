import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmConfig } from './database/orm-config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserModule } from './domains/user/user.module';
import { AuthModule } from './domains/auth/auth.module';
import { BearerAccessTokenMiddleware } from './domains/auth/middlewares/bearer-access-token.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTimeInterceptor } from './core/interceptor/response-time.interceptor';
import { CommonModule } from './common/common.module';

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
    UserModule,
    AuthModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BearerAccessTokenMiddleware)
      .exclude(
        {
          path: 'auth/social-login',
          method: RequestMethod.POST,
        },
        {
          path: 'auth/token/access',
          method: RequestMethod.POST,
        },
      )
      .forRoutes('*');
  }
}
