// import { ConfigService } from '@nestjs/config';
// import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
// import { Injectable } from '@nestjs/common';
// import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// @Injectable()
// export class OrmConfig implements TypeOrmOptionsFactory {
//   constructor(private readonly configService: ConfigService) {}

//   createTypeOrmOptions(): TypeOrmModuleOptions {
//     return {
//       type: 'postgres',
//       host: this.configService.get<string>('DB_HOST'),
//       port: parseInt(this.configService.get<string>('DB_PORT')),
//       username: this.configService.get<string>('DB_USER'),
//       password: this.configService.get<string>('DB_PASSWORD'),
//       database: this.configService.get<string>('DB_DATABASE'),
//       entities: ['dist/**/*.entity{.ts,.js}'],
//       synchronize: process.env.ENV_NODE === 'production' ? false : true,
//       logging: process.env.ENV_NODE === 'production' ? false : true,
//       namingStrategy: new SnakeNamingStrategy(),
//     };
//   }
// }
