import {
  Inject,
  Injectable,
  NestMiddleware,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerContextMiddleware implements NestMiddleware {
  constructor(@Inject(Logger) private readonly logger: LoggerService) {}
  use(req: Request, res: Response, next: NextFunction): void {
    // const { ip, method, originalUrl, headers } = req;
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    const datetime = new Date();

    // 추후 jwt auth import
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      this.logger.log(
        `${datetime} ${method} ${originalUrl} ${statusCode} ${contentLength}- ${userAgent} ${ip}`,
      );
    });
    next();
  }
}
