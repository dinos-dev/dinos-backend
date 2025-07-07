import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { SlackService } from 'src/infrastructure/slack/slack.service';
import { WinstonLoggerService } from '../../infrastructure/logger/winston-logger.service';
import { ConfigService } from '@nestjs/config';
import { ERROR_CHANNEL } from 'src/infrastructure/slack/constant/channel.const';

@Injectable()
export class SlackErrorInterceptor implements NestInterceptor {
  constructor(
    private readonly slackService: SlackService,
    private readonly logger: WinstonLoggerService,
    private readonly configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();
        const errorContext = {
          method: request.method,
          url: request.url,
          body: request.body,
          user: request.user ? request.user.id : 'anonymous',
          timestamp: new Date().toISOString(),
        };

        // Slack 알림 전송
        this.slackService.sendErrorNotification(ERROR_CHANNEL, error, errorContext);

        this.logger.error(`Error: ${error.message}, Context: ${JSON.stringify(errorContext)}`);
        return throwError(() => error);
      }),
    );
  }
}
