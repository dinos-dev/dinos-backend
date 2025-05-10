import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
@Injectable()
export class JwtAuthGuard extends AuthGuard('auth') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException(HttpErrorConstants.EXPIRED_TOKEN);
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(HttpErrorConstants.UNAUTHORIZED_INVALID_SIGNATURE);
      }
      throw err || new UnauthorizedException(HttpErrorConstants.NOT_FOUND_TOKEN);
    }
    return user;
  }
}
