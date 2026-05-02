import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { firstValueFrom } from 'rxjs';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { OAuthPayLoad } from 'src/auth/domain/interface/token-payload.interface';
import { Provider } from 'src/user/domain/const/provider.enum';
import { WinstonLoggerService } from 'src/infrastructure/logger/winston-logger.service';
import { getErrorStack } from 'src/common/utils/error.util';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    super();
  }
  /**
   * @todo request object type safety
   * request object validation
   * */
  async validate(req: any): Promise<OAuthPayLoad> {
    const { token } = req.body;
    if (!token) {
      throw new UnauthorizedException(HttpErrorConstants.SOCIAL_TOKEN_REQUIRED);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(this.configService.get<string>('NAVER_AUTH_URL'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      /**
       * @todo
       * 실제 Naver Token으로 검증필요
       * 데이터 적합성이 일치하는지에 대해서도 판별 필요.
       */
      const payload = {
        email: response.data.response.email,
        name: response.data.response.name,
        provider: Provider.NAVER,
        providerId: response.data.response.id,
      };
      return payload;
    } catch (err) {
      this.logger.error('Naver OAuth 검증 오류', getErrorStack(err));
      throw new InternalServerErrorException(HttpErrorConstants.SOCIAL_TOKEN_INTERNAL_SERVER_ERROR);
    }
  }
}
