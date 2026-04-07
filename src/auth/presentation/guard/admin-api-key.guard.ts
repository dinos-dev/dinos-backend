import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const apiKey = req.headers['x-admin-api-key'];

    if (!apiKey || apiKey !== this.configService.get<string>('ADMIN_API_KEY')) {
      throw new UnauthorizedException(HttpErrorConstants.UNAUTHORIZED);
    }

    return true;
  }
}
