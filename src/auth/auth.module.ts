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
import { TOKEN_REPOSITORY, USER_REPOSITORY } from 'src/common/config/common.const';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { UserRepository } from 'src/user/infrastructure/repository/user.repository';

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
