import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { OAuthPayLoad } from '../interface/token-payload.interface';
import { Provider } from '../helper/provider.enum';
import { ENV_CONFIG } from 'src/core/config/env-keys.const';
import { WinstonLoggerService } from 'src/core/logger/winston-logger.service';

interface AppleJwtPayload {
  sub: string;
  email?: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  nonce?: string;
}

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  private readonly jwksClient: jwksClient.JwksClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: WinstonLoggerService,
  ) {
    super();
    this.jwksClient = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }

  async validate(req: any): Promise<OAuthPayLoad> {
    const { token, fullName, nonce } = req.body;
    console.log('Received request body:', req.body); // 디버깅: 요청 본문 출력

    if (!token || typeof token !== 'string') {
      console.error('Token is missing, undefined, or not a string:', token);
      throw new UnauthorizedException(HttpErrorConstants.SOCIAL_TOKEN_REQUIRED);
    }

    try {
      // 1. IdentityToken 디코딩
      const decoded = jwt.decode(token, { complete: true });
      console.log('Decoded token:', decoded); // 디버깅: 디코딩 결과 출력

      if (!decoded || !decoded.header || !decoded.header.kid) {
        console.error('Invalid decoded token:', decoded);
        throw new UnauthorizedException('Invalid Apple Identity Token');
      }

      // 2. JWKS에서 공개 키 가져오기
      const key = await this.jwksClient.getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();

      // 3. IdentityToken 검증
      const payload = jwt.verify(token, publicKey, {
        issuer: 'https://appleid.apple.com',
        audience: this.configService.get<string>(ENV_CONFIG.SOCIAL_AUTH.APPLE_CLIENT_ID),
        algorithms: ['RS256'],
      }) as AppleJwtPayload;

      // 4. Nonce 검증 (제공된 경우)
      if (nonce && payload.nonce !== nonce) {
        throw new UnauthorizedException('Invalid nonce');
      }

      // 5. OAuthPayLoad로 변환
      const oauthPayload: OAuthPayLoad = {
        email: payload.email || 'no-email-provided',
        name:
          fullName && (fullName.givenName || fullName.familyName)
            ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
            : null,
        provider: Provider.APPLE,
        providerId: payload.sub,
      };

      return oauthPayload;
    } catch (err) {
      console.error('Apple token validation error:', err);
      this.logger.error('Apple token validation error', err);
      throw new InternalServerErrorException(HttpErrorConstants.SOCIAL_TOKEN_INTERNAL_SERVER_ERROR);
    }
  }
}
