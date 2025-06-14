import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { TokenRepository } from './repository/token.repository';
import { UserRepository } from '../user/repository/user.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NaverStrategy } from './strategy/naver.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { AppleStrategy } from './strategy/apple.strategy';
import { HttpModule } from '@nestjs/axios';

import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { TOKEN_REPOSITORY, USER_REPOSITORY } from 'src/core/config/common.const';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Module({
  imports: [JwtModule.register({}), HttpModule.register({}), PassportModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: TOKEN_REPOSITORY,
      useClass: TokenRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    NaverStrategy,
    GoogleStrategy,
    AppleStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    PrismaService,
  ],
  exports: [AuthService, JwtModule, PassportModule, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
