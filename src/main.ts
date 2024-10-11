import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSwagger } from './core/swagger/swagger-config';
import { middleware } from './app.middleware';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create(AppModule);

  middleware(app);

  if (!isProduction) {
    initSwagger(app);
  }

  await app.listen(3000);
}
bootstrap();
