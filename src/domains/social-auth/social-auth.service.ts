import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SocialAuthService {
  constructor(private readonly configService: ConfigService) {}

  /**클라이언트에서 반환한 Token값을 기반으로 구글 유저 정보를 조회한다.*/
  async googleAuthClient() {}

  /**클라이언트에서 반환한 Token값을 기반으로 네이버 유저 정보를 조회한다.*/
  async naverAuthClient() {}

  /**클라이언트에서 반환한 Token값을 기반으로 애플 유저 정보를 조회한다.*/
  async appleAuthClient() {}

  /**클라이언트에서 반환한 Token값을 기반으로 카카오 유저 정보를 조회한다.*/
  async kakaoAuthClient() {}
}
