import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';

/**
 * JWT payload에서 userId(sub)를 추출하는 데코레이터
 * sub가 없을 경우 UnauthorizedException을 throw하여 null이 컨트롤러에 도달하지 않도록 보장한다
 */
export const UserId = createParamDecorator((data: unknown, ctx: ExecutionContext): number => {
  const req = ctx.switchToHttp().getRequest();
  const userId = req?.user?.sub;

  if (!userId) {
    throw new UnauthorizedException(HttpErrorConstants.NOT_FOUND_TOKEN);
  }

  return userId;
});
