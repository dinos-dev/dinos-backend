import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
// import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private configService: ConfigService,
    // private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('REFRESH_SECRET'),
    });
  }

  async validate(payload: any) {
    // // Refresh 토큰의 payload 검증
    // const isValid = await this.authService.validateRefreshToken(payload.sub, payload);
    // if (!isValid) {
    //   throw new UnauthorizedException(HttpErrorConstants.INVALID_TOKEN);
    // }
    return { userId: payload.sub }; // req.user에 주입
  }
}
