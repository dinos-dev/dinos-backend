import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { firstValueFrom } from 'rxjs';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { Provider } from '../../domain/constant/provider.enum';
import { OAuthPayLoad } from 'src/auth/domain/interface/token-payload.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  // request object validation
  async validate(req: any): Promise<OAuthPayLoad> {
    const { token } = req.body;
    if (!token) {
      throw new UnauthorizedException(HttpErrorConstants.SOCIAL_TOKEN_REQUIRED);
    }
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.configService.get<string>('GOOGLE_AUTH_URL')}?id_token=${token}`),
      );

      // passport 모듈에 의해, 실제 decorator에서 받을 때, user 객체로 치환되어서 핸들링
      const payload = {
        email: response.data.email,
        name: response.data.name,
        provider: Provider.GOOGLE,
        providerId: response.data.sub,
      };

      return payload;
    } catch (err) {
      console.log('error->', err);
      throw new InternalServerErrorException(HttpErrorConstants.SOCIAL_TOKEN_INTERNAL_SERVER_ERROR);
    }
  }
}
