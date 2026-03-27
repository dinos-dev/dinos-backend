import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { firstValueFrom } from 'rxjs';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { OAuthPayLoad } from 'src/auth/domain/interface/token-payload.interface';
import { Provider } from 'src/user/domain/const/provider.enum';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async validate(req: any): Promise<OAuthPayLoad> {
    const { token } = req.body;
    if (!token) {
      throw new UnauthorizedException(HttpErrorConstants.SOCIAL_TOKEN_REQUIRED);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(this.configService.get<string>('KAKAO_AUTH_URL'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      const email = response.data.kakao_account?.email;

      // 이메일 미동의 또는 카카오 계정에 이메일 미등록 케이스 방어
      if (!email) {
        throw new UnauthorizedException(HttpErrorConstants.SOCIAL_TOKEN_REQUIRED);
      }

      const payload: OAuthPayLoad = {
        email,
        name: response.data.kakao_account?.profile?.nickname ?? null,
        provider: Provider.KAKAO,
        providerId: String(response.data.id),
      };

      return payload;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new InternalServerErrorException(HttpErrorConstants.SOCIAL_TOKEN_INTERNAL_SERVER_ERROR);
    }
  }
}
