import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SocialToken = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req?.user;
});
