import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ENV_CONFIG } from '../core/config/env-keys.const';
import { Injectable } from '@nestjs/common';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class OrmConfig implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get<string>(ENV_CONFIG.DB.HOST),
      port: parseInt(this.configService.get<string>(ENV_CONFIG.DB.PORT)),
      username: this.configService.get<string>(ENV_CONFIG.DB.USER),
      password: this.configService.get<string>(ENV_CONFIG.DB.PASSWORD),
      database: this.configService.get<string>(ENV_CONFIG.DB.DATABASE),
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: process.env.ENV_NODE === 'production' ? false : true,
      logging: process.env.ENV_NODE === 'production' ? false : true,
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}
