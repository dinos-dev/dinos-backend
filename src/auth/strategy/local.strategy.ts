import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  /**
   * @param email
   * @param password
   * @return Req
   * */
  async validate(email: string, password: string) {
    const user = this.authService.authenticate(email, password);

    return user;
  }
}
