import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';
import { Request, Response } from 'express';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, headers } = request;
    const userAgent = headers['user-agent'];
    const ip = request.ip || request.connection.remoteAddress;

    const startTime = Date.now();

    // Log da requisição recebida
    this.loggingService.logHttpRequest(method, url, userAgent, ip);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Log da resposta enviada
          this.loggingService.logHttpResponse(
            method,
            url,
            statusCode,
            responseTime,
          );

          // Log adicional para operações de criação/atualização/deleção
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            this.loggingService.log(
              `Operação ${method} realizada com sucesso`,
              'HttpOperation',
              {
                method,
                url,
                statusCode,
                responseTime: `${responseTime}ms`,
                hasResponseData: !!data,
              },
            );
          }
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.loggingService.error(
            `Erro na requisição HTTP: ${error.message}`,
            error.stack,
            'HttpError',
            {
              method,
              url,
              statusCode,
              responseTime: `${responseTime}ms`,
              userAgent,
              ip,
            },
          );
        },
      }),
    );
  }
}
