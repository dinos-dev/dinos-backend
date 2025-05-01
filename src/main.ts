import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSwagger } from './core/swagger/swagger-config';
import { middleware } from './app.middleware';
import { NestExpressApplication } from '@nestjs/platform-express';
import { winstonLogger } from './core/utils/winston.logger';
import { BadRequestException, ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpErrorConstants } from './core/http/http-error-objects';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    logger: winstonLogger, // replacing logger
  });

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        console.log('error --->', errors);
        return new BadRequestException(HttpErrorConstants.VALIDATE_ERROR);
      },
    }),
  );

  middleware(app);

  if (!isProduction) {
    initSwagger(app);
  }

  await app.listen(80);
}
bootstrap();
