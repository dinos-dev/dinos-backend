import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { RefreshTokenRepository } from './repository/refresh-token.repository';
import { UserRepository } from '../user/repository/user.repository';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([Token])],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenRepository, UserRepository],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
