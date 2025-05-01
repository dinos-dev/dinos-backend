import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { TokenRepository } from './repository/token.repository';
import { UserRepository } from '../user/repository/user.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NaverStrategy } from './strategy/naver.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { AppleStrategy } from './strategy/apple.strategy';
import { HttpModule } from '@nestjs/axios';
import { SocialAccountRepository } from './repository/social-account.repository';
import { SocialAccount } from './entities/social-account.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([Token, User, SocialAccount]), HttpModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenRepository,
    SocialAccountRepository,
    UserRepository,
    NaverStrategy,
    GoogleStrategy,
    AppleStrategy,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
