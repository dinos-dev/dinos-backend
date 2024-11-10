import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/domains/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { SocialAuthModule } from '../social-auth/social-auth.module';

@Module({
  imports: [JwtModule.register({}), UserModule, SocialAuthModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
