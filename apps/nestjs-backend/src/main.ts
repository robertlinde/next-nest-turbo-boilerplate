import {Logger, ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, OpenAPIObject, SwaggerModule} from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {AppModule} from './app.module';
import {MikroOrmExceptionFilter} from './common/filters/mikro-orm-exception/mikro-orm-exception.filter';
import {Logger as LoggerService} from './common/logger/logger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.use(helmet());

  app.enableCors({
    origin: process.env.FRONTEND_HOST,
    credentials: true,
  });

  app.useLogger(new LoggerService());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.useGlobalFilters(new MikroOrmExceptionFilter());

  if (process.env.ENABLE_SWAGGER === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('nest auth boilerplate')
      .setDescription('The nest auth boilerplate API description')
      .setVersion('1.0')
      .build();
    const documentFactory = (): OpenAPIObject => SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 4000);

  if (process.env.ENABLE_SWAGGER === 'true') {
    const logger = new Logger('bootstrap', {timestamp: true});
    logger.log(`Swagger is running on: ${await app.getUrl()}/api/docs`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises, unicorn/prefer-top-level-await
bootstrap();
