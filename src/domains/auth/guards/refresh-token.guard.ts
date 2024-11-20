import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const bearerRefreshToken = await req.headers['authorization'];

    if (!bearerRefreshToken) {
      throw new UnauthorizedException(HttpErrorConstants.NOT_FOUND_TOKEN);
    }
    // 토큰 유효성 검사
    const token = await this.authService.validateBearerToken(bearerRefreshToken);
    // payLoad
    const payLoad = await this.authService.parseBearerToken(token, true);

    // req 객체에 본문을 포함해서 리턴
    req.user = payLoad;

    return true;
  }
}
