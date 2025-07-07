import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';
import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private logger: winston.Logger;
  private static readonly logDir = __dirname + '/../../logs';
  private static readonly isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    this.logger = winston.createLogger({
      level: WinstonLoggerService.isProduction ? 'info' : 'silly',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('dinos', {
          colors: !WinstonLoggerService.isProduction,
          prettyPrint: !WinstonLoggerService.isProduction,
        }),
      ),
      transports: [
        new winston.transports.Console({
          level: WinstonLoggerService.isProduction ? 'info' : 'silly',
          format: WinstonLoggerService.isProduction
            ? winston.format.simple()
            : winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                nestWinstonModuleUtilities.format.nestLike('dinos', {
                  colors: true,
                  prettyPrint: true,
                }),
              ),
        }),
        new winstonDaily({
          ...this.getDailyOptions('info'),
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
        new winstonDaily({
          ...this.getDailyOptions('warn'),
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
        new winstonDaily({
          ...this.getDailyOptions('error'),
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      ],
    });
  }

  private getDailyOptions(level: string) {
    let dirname = WinstonLoggerService.logDir;
    if (level === 'error') {
      dirname += '/error';
    }

    return {
      level,
      datePattern: 'YYYY-MM-DD',
      dirname,
      filename: `%DATE%.${level}.log`,
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    };
  }

  log(message: string): void {
    this.logger.info(message);
  }

  error(message: string, trace?: string): void {
    this.logger.error({ message, stack: trace });
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }

  verbose(message: string): void {
    this.logger.verbose(message);
  }
}
