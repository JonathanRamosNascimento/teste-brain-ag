import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggingService } from '../../logging/logging.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly loggingService: LoggingService) {
    super();
  }

  async onModuleInit() {
    this.loggingService.log('Conectando ao banco de dados...', 'Database');
    const startTime = Date.now();

    await this.$connect();

    const duration = Date.now() - startTime;
    this.loggingService.log(
      'Conexão com banco de dados estabelecida',
      'Database',
      {
        duration: `${duration}ms`,
      },
    );
  }

  async onModuleDestroy() {
    this.loggingService.log('Desconectando do banco de dados...', 'Database');
    const startTime = Date.now();

    await this.$disconnect();

    const duration = Date.now() - startTime;
    this.loggingService.log(
      'Conexão com banco de dados encerrada',
      'Database',
      {
        duration: `${duration}ms`,
      },
    );
  }
}
