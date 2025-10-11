import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpResponse } from '../http/http-response';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // HttpResponse 객체인 경우 상태 코드 설정
        if (data instanceof HttpResponse) {
          response.status(data.getStatus());

          // 204인 경우 빈 응답 반환
          if (data.getStatus() === HttpStatus.NO_CONTENT) {
            return undefined;
          }
          return data;
        }

        // 일반 객체인 경우에 반환
        return data;
      }),
    );
  }
}
