import { CallHandler, ExecutionContext, Injectable, NestInterceptor, RequestTimeoutException } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const req = ctx.switchToHttp().getRequest();

    const reqTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const resTime = Date.now();
        const diff = resTime - reqTime;

        if (diff > 2500) {
          throw new RequestTimeoutException(HttpErrorConstants.TIMEOUT_EXCEPTION);
        } else {
          /**
           * @TODO
           * 로커 모듈 추가후 핸들링 가능하도록 설정
           * 현재는 임시(개발환경에서) console.log로 찍히도록 설정
           * */
          console.log(`[${req.method} ${req.path}] ${diff} ms`);
        }
      }),
    );
  }
}
