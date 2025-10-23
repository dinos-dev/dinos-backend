import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { TokenRepository } from 'src/auth/infrastructure/repository/token.repository';
import { AuthController } from 'src/auth/presentation/auth.controller';
import { AuthService } from 'src/auth/application/auth.service';
import { NaverStrategy } from 'src/auth/infrastructure/strategy/naver.strategy';
import { GoogleStrategy } from 'src/auth/infrastructure/strategy/google.strategy';
import { AppleStrategy } from 'src/auth/infrastructure/strategy/apple.strategy';
import { HttpModule } from '@nestjs/axios';

import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/auth/infrastructure/strategy/jwt.strategy';
import { JwtRefreshStrategy } from 'src/auth/infrastructure/strategy/jwt-refresh.strategy';
import {
  INVITE_CODE_REPOSITORY,
  PROFILE_REPOSITORY,
  TOKEN_REPOSITORY,
  USER_REPOSITORY,
} from 'src/common/config/common.const';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { UserRepository } from 'src/user/infrastructure/repository/user.repository';
import { ProfileRepository } from 'src/user/infrastructure/repository/profile.repository';
import { InviteCodeRepository } from 'src/user/infrastructure/repository/invite-code.repository';
import { EventModule } from 'src/infrastructure/event/event.module';

@Module({
  imports: [JwtModule.register({}), HttpModule.register({}), PassportModule, EventModule],
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
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileRepository,
    },
    {
      provide: INVITE_CODE_REPOSITORY,
      useClass: InviteCodeRepository,
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
