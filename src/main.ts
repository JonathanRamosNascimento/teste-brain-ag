import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingService } from './logging/logging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const loggingService = app.get(LoggingService);

  const config = new DocumentBuilder()
    .setTitle('Brain Ag')
    .setDescription('API do sistema de gerenciamento de produtores rurais')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory, {
    swaggerOptions: {
      docExpansion: 'none',
    },
  });

  const port = process.env.PORT ?? 3000;
  const environment = process.env.NODE_ENV ?? 'development';

  loggingService.log('Iniciando aplicação Brain Ag...', 'Bootstrap', {
    port,
    environment,
    swaggerDocs: '/docs',
  });

  await app.listen(port);

  loggingService.logApplicationStart(Number(port), environment);

  process.on('SIGTERM', () => {
    loggingService.logApplicationShutdown();
    app.close();
  });

  process.on('SIGINT', () => {
    loggingService.logApplicationShutdown();
    app.close();
  });
}
bootstrap();
