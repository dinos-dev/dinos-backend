import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * payLoad에서 User sub 값을 추출하는 데코레이터
 */
export const UserId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  /**
   * @Todo
   * payLoad의 user, sub가 middleware에서 추출되지 않았을 경우 어떻게 핸들링할지 정해야함.
   * 현재는 null 값이 들어와도 넘기는 형식으로 처리
   * */
  return req?.user?.sub;
});
