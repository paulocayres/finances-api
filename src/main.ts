import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  /*const httpsOptions = {
    key: fs.readFileSync('ssl/key.pem'),
    cert: fs.readFileSync('ssl/cert.pem'),
  };
  
    const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });*/

  const app = await NestFactory.create(AppModule);


  app.enableCors({
    origin: '*', // Permite requisições do seu app Ionic
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization'
  });
  //await app.listen(process.env.PORT ?? 3000);
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
