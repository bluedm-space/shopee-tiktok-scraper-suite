import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      // 'http://tools.bluedm-space.com:3000',
      'http://192.168.1.105:3000',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
  });

  await app.listen(3001, '0.0.0.0');
}

bootstrap();
