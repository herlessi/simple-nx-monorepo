import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/** Loga método, rota, status e duração de cada requisição. */
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      this.logger.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`,
      );
    });
    next();
  }
}
