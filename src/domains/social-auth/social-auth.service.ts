import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SocialAuthService {
  constructor(private readonly configService: ConfigService) {}

  async googleAuthClient() {}

  async appleAuthClient() {}

  async naverAuthClient() {}

  async kakaoAuthClient() {}
}
