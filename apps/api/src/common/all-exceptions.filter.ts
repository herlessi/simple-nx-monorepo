import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiErrorBody } from '@ci-cd/shared-types';
import type { Request, Response } from 'express';

type ErrorPayload = Omit<ApiErrorBody, 'statusCode' | 'path' | 'timestamp'>;

function toPayload(response: string | object): ErrorPayload {
  if (typeof response === 'string') return { message: response };
  const { message, ...rest } = response as Record<string, unknown>;
  delete rest.statusCode;
  return {
    ...rest,
    message: Array.isArray(message) ? message.join('; ') : String(message),
  };
}

/**
 * Padroniza o corpo de erro da API e centraliza o log das exceções.
 * Ponto de extensão para a telemetria: registrar a exceção no span ativo
 * (`span.recordException`) e marcar o status do span como erro.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = isHttp
      ? toPayload(exception.getResponse())
      : { message: 'Erro interno do servidor' };

    if (status >= 500) {
      this.logger.error(
        `${req.method} ${req.originalUrl} -> ${status}: ${payload.message}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`${req.method} ${req.originalUrl} -> ${status}: ${payload.message}`);
    }

    const body: ApiErrorBody = {
      statusCode: status,
      ...payload,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    };
    res.status(status).json(body);
  }
}
