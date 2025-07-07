import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'auth') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    try {
      return payload;
    } catch (err) {
      console.log('error->', err);
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
    }
  }
}
