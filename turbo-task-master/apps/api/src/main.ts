/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { LoggingService } from './app/services/logging.service';
import { AuditLoggerService } from './app/audit/audit-logger.service';
import { LoggingInterceptor } from './app/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = '';
  app.setGlobalPrefix(globalPrefix);

  // Get logging services
  const loggingService = app.get(LoggingService);
  const auditLoggerService = app.get(AuditLoggerService);

  // Set up global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor(loggingService, auditLoggerService));

  app.enableCors({
    origin: '*/', // allow Angular app
    //credentials: true,               // if using cookies/auth headers
  });

  const config = new DocumentBuilder()
  .setTitle('Turbo Task API V1')
  .setDescription('The Turbo Task API description')
  .setVersion('1.0')
  .addTag('turbotask')
  .build();

  const options: SwaggerDocumentOptions =  {
    operationIdFactory: (
      controllerKey: string,
      methodKey: string
    ) => methodKey
  };

  const documentFactory = () => SwaggerModule.createDocument(app, config,options);


  SwaggerModule.setup('docs', app, documentFactory,);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  // Log application startup
  loggingService.info('Application started successfully', {
    port,
    environment: process.env.NODE_ENV || 'development',
    loggingEnabled: loggingService.getConfig().enableLogging,
    logLevel: loggingService.getConfig().logLevel,
  });
  
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
