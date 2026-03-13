import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { RequestWithContext } from '../interfaces/request-with-context.interface';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  use(req: RequestWithContext, res: Response, next: NextFunction): void {
    const startTime = process.hrtime.bigint();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const elapsedInMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
      const requestId = req.requestId ?? 'n/a';

      this.logger.log(
        `${method} ${originalUrl} ${res.statusCode} ${elapsedInMs.toFixed(2)}ms [requestId=${requestId}]`,
      );
    });

    next();
  }
}
