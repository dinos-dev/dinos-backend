import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import {
  ENV_DB_DATABASE,
  ENV_DB_HOST,
  ENV_DB_PASSWORD,
  ENV_DB_PORT,
  ENV_DB_USER,
} from '../const/env-keys.const';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrmConfig implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get<string>(ENV_DB_HOST),
      port: parseInt(this.configService.get<string>(ENV_DB_PORT)),
      username: this.configService.get<string>(ENV_DB_USER),
      password: this.configService.get<string>(ENV_DB_PASSWORD),
      database: this.configService.get<string>(ENV_DB_DATABASE),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.ENV_NODE === 'production' ? false : true,
      logging: process.env.ENV_NODE === 'production' ? false : true,
    };
  }
}
