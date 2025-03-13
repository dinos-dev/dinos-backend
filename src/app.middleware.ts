import { INestApplication } from '@nestjs/common';
import * as helmet from 'helmet';
import * as hpp from 'hpp';

/**
 * 공용 미들웨어 정의
 */
export function middleware(app: INestApplication): INestApplication {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(hpp());
    app.use(helmet);
  }

  return app;
}
