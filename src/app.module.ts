import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmConfig } from './common/database/orm-config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserModule } from './domains/user/user.module';
import { AuthModule } from './domains/auth/auth.module';
import { BearerAccessTokenMiddleware } from './domains/auth/middlewares/bearer-access-token.middleware';

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
  ],
  controllers: [AppController],
  providers: [AppService],
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
