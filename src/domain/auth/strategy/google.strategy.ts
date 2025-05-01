import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { firstValueFrom } from 'rxjs';
import { ENV_CONFIG } from 'src/core/config/env-keys.const';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  // request object validation
  async validate(req: any): Promise<any> {
    const { token } = req.body;
    if (!token) {
      throw new UnauthorizedException(HttpErrorConstants.SOCIAL_TOKEN_REQUIRED);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.configService.get<string>(ENV_CONFIG.SOCIAL_AUTH.GOOGLE_AUTH_URL)}?id_token=${token}`,
        ),
      );
      // 실제 Google Token으로 검증 sub-> provider ID
      return response.data;
    } catch (err) {
      console.log('error->', err);
      throw new InternalServerErrorException(HttpErrorConstants.SOCIAL_TOKEN_INTERNAL_SERVER_ERROR);
    }
  }
}
