import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**Custom Transaction Manager*/
export const TransactionManger = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.queryRunnerManager;
});
