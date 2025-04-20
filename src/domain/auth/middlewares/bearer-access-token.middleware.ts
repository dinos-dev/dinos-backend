import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { ENV_CONFIG } from 'src/core/config/env-keys.const';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BearerAccessTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 헤더값 추출
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException(HttpErrorConstants.NOT_FOUND_TOKEN);
    }

    const bearerTokenSplit = authHeader.split(' ');

    if (bearerTokenSplit.length !== 2) {
      throw new UnauthorizedException(HttpErrorConstants.INVALID_TOKEN_FORMAT);
    }

    const [bearer, token] = bearerTokenSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new UnauthorizedException(HttpErrorConstants.INVALID_BEARER_TOKEN);
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(ENV_CONFIG.AUTH.ACCESS_SECRET),
      });

      req.user = payload;

      next();
    } catch (error) {
      console.error('token verify exception error ->', error.name);
      if (error.name === 'TokenExpiredError') {
        // 토큰 만료 -> 재로그인 or 발급
        throw new UnauthorizedException(HttpErrorConstants.EXPIRED_TOKEN);
      }
      if (error.name === 'JsonWebTokenError') {
        // signature 불일치
        throw new UnauthorizedException(HttpErrorConstants.UNAUTHORIZED_INVALID_SIGNATURE);
      }
      next();
    }
  }

  /**
   * AT 토큰 검증 메서드
   * @param rawToken  AccessToken
   */
  async verifyAccessToken(accessToken: string) {
    try {
      return await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get<string>(ENV_CONFIG.AUTH.ACCESS_SECRET),
      });
    } catch (error) {
      console.error('token verify exception error ->', error.name);
      if (error.name === 'TokenExpiredError') {
        // 토큰 만료 -> 재로그인 or 발급
        throw new UnauthorizedException(HttpErrorConstants.EXPIRED_TOKEN);
      }
      if (error.name === 'JsonWebTokenError') {
        // signature 불일치
        throw new UnauthorizedException(HttpErrorConstants.UNAUTHORIZED_INVALID_SIGNATURE);
      }
    }
  }
}
