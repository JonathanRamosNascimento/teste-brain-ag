import { Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggingService extends Logger {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {
    super();
  }

  private formatMessage(message: string, context?: string, meta?: any): any {
    return {
      message,
      context: context || this.context,
      ...meta,
    };
  }

  log(message: string, context?: string, meta?: any): void {
    this.logger.info(this.formatMessage(message, context, meta));
  }

  error(message: string, trace?: string, context?: string, meta?: any): void {
    this.logger.error(this.formatMessage(message, context, { trace, ...meta }));
  }

  warn(message: string, context?: string, meta?: any): void {
    this.logger.warn(this.formatMessage(message, context, meta));
  }

  debug(message: string, context?: string, meta?: any): void {
    this.logger.debug(this.formatMessage(message, context, meta));
  }

  verbose(message: string, context?: string, meta?: any): void {
    this.logger.verbose(this.formatMessage(message, context, meta));
  }

  // Métodos específicos para diferentes tipos de eventos
  logHttpRequest(
    method: string,
    url: string,
    userAgent?: string,
    ip?: string,
  ): void {
    this.log('HTTP Request recebida', 'HttpRequest', {
      method,
      url,
      userAgent,
      ip,
    });
  }

  logHttpResponse(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
  ): void {
    this.log('HTTP Response enviada', 'HttpResponse', {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
    });
  }

  logDatabaseOperation(
    operation: string,
    entity: string,
    duration?: number,
    recordId?: string,
  ): void {
    this.log('Operação de banco de dados', 'Database', {
      operation,
      entity,
      duration: duration ? `${duration}ms` : undefined,
      recordId,
    });
  }

  logBusinessLogic(useCase: string, action: string, data?: any): void {
    this.log('Execução de caso de uso', 'BusinessLogic', {
      useCase,
      action,
      data,
    });
  }

  logValidationError(field: string, value: any, error: string): void {
    this.warn('Erro de validação', 'Validation', {
      field,
      value,
      error,
    });
  }

  logApplicationStart(port: number, environment: string): void {
    this.log('Aplicação iniciada com sucesso', 'Application', {
      port,
      environment,
      timestamp: new Date().toISOString(),
    });
  }

  logApplicationShutdown(): void {
    this.log('Aplicação está sendo encerrada', 'Application', {
      timestamp: new Date().toISOString(),
    });
  }
}
