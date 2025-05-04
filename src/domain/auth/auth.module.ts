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
import { User } from '../user/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([Token, User]), HttpModule.register({}), PassportModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenRepository,
    UserRepository,
    NaverStrategy,
    GoogleStrategy,
    AppleStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthService, JwtModule, PassportModule, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
