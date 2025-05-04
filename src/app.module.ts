import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmConfig } from './database/orm-config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserModule } from './domain/user/user.module';
import { AuthModule } from './domain/auth/auth.module';
// import { BearerAccessTokenMiddleware } from './domain/auth/middleware/bearer-access-token.middleware';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTimeInterceptor } from './core/interceptor/response-time.interceptor';
import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './domain/auth/guard/jwt-auth.guard';

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
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
// implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(BearerAccessTokenMiddleware)
//       // .exclude(
//       //   {
//       //     path: 'auth/social-login',
//       //     method: RequestMethod.POST,
//       //   },
//       //   {
//       //     path: 'auth/token/access',
//       //     method: RequestMethod.POST,
//       //   },
//       //   {
//       //     path: 'auth/naver',
//       //     method: RequestMethod.POST,
//       //   },
//       //   {
//       //     path: 'auth/google',
//       //     method: RequestMethod.POST,
//       //   },
//       // )
//       .forRoutes('*');
//   }
// }
