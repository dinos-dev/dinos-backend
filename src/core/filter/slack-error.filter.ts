// src/core/filters/global-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { SlackService } from '../../infrastructure/slack/slack.service';
import { WinstonLoggerService } from '../../core/logger/winston-logger.service';
import { ERROR_CHANNEL } from '../../infrastructure/slack/constant/channel.const';
import { HttpErrorFormat } from '../../core/http/http-error-objects';

@Injectable()
@Catch()
export class SlackErrorFilter implements ExceptionFilter {
  constructor(
    private readonly slackService: SlackService,
    private readonly logger: WinstonLoggerService,
  ) {}

  catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // error context
    const errorContext = {
      method: request.method,
      url: request.url,
      body: request.body,
      user: request.user ? (request.user as any).id : 'anonymous',
      timestamp: new Date().toISOString(),
    };

    // if (process.env.NODE_ENV === 'production') {
    this.slackService.sendErrorNotification(ERROR_CHANNEL, error, errorContext);
    //   }

    this.logger.error(`Error: ${error.message}, Context: ${JSON.stringify(errorContext)}`);

    // HttpException 처리
    if (error instanceof HttpException) {
      const status = error.getStatus();
      const errorResponse = error.getResponse();

      let errorObj: HttpErrorFormat = {
        status,
        error: 'UNKNOWN_ERROR',
        message: error.message || 'Internal server error',
      };

      if (typeof errorResponse === 'object' && errorResponse !== null) {
        errorObj = {
          status: (errorResponse as HttpErrorFormat).status || status,
          error: (errorResponse as HttpErrorFormat).error || 'UNKNOWN_ERROR',
          message: (errorResponse as HttpErrorFormat).message || error.message,
        };
      } else if (typeof errorResponse === 'string') {
        errorObj = {
          status,
          error: errorResponse,
          message: errorResponse,
        };
      }

      response.status(status).json({
        status: errorObj.status,
        error: errorObj.error,
        message: errorObj.message,
      });
    } else {
      response.status(500).json({
        status: 500,
        error: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Internal server error',
      });
    }
  }
}
