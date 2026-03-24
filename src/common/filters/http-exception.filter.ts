import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  NotFoundException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { join } from 'path';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Handle 404s for non-API routes with the monkey image
    if (exception instanceof NotFoundException && !request.url.startsWith('/api')) {
      return response.sendFile(join(process.cwd(), 'public/assets/monkey.jpg'));
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const messageResponse =
      exception instanceof HttpException
        ? (exception.getResponse() as any).message || exception.message
        : 'Internal server error';

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception.stack,
        'ExceptionFilter',
      );
    }

    // Standardized error format
    const errorResponse = {
      status: status || 'error',
      timestamp: new Date().toISOString(),
      path: request.url,
      message: messageResponse, // Keep the full array for validation errors rather than just message[0]
      ...(status === HttpStatus.INTERNAL_SERVER_ERROR && process.env.NODE_ENV !== 'production'
        ? { stack: exception.stack } // Provide stack trace in dev
        : {}),
    };

    response.status(status).json(errorResponse);
  }
}
