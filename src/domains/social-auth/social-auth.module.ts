import { Module } from '@nestjs/common';
import { SocialAuthService } from './social-auth.service';

@Module({
  providers: [SocialAuthService],
  exports: [SocialAuthService],
})
export class SocialAuthModule {}
