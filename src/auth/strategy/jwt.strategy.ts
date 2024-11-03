import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ENV_CONFIG } from 'src/common/const/env-keys.const';

/** Access Token 검증을 위한 JwtStrategy*/
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      // Bearer token에서 값을 추출
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiratioin: false,
      secretOrKey: configService.get<string>(ENV_CONFIG.AUTH.ACCESS_SECRET),
    });
  }
  validate() {}
}
