import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UserRepository } from '../user/repositories/user.repository';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([RefreshToken])],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenRepository, UserRepository],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
