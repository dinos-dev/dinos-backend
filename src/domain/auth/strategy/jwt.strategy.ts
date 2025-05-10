import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ENV_CONFIG } from 'src/core/config/env-keys.const';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'auth') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(ENV_CONFIG.AUTH.ACCESS_SECRET),
    });
  }

  async validate(payload: any) {
    try {
      console.log('payload----->', payload);
      return payload;
    } catch (err) {
      console.log('error->', err);
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
    }
  }
}
