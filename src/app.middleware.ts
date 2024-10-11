import { INestApplication } from '@nestjs/common';
import * as csurf from 'csurf';
import * as helmet from 'helmet';
import * as hpp from 'hpp';
import * as compression from 'compression';

/**
 * 공용 미들웨어 정의
 */
export function middleware(app: INestApplication): INestApplication {
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(compression());

  if (isProduction) {
    app.use(csurf());

    app.use(hpp());

    app.use(helmet.hidePoweredBy());
    app.use(helmet.xssFilter());
    app.use(helmet.frameguard());
  }

  return app;
}
