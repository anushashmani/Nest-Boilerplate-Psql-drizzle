import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { join } from 'path';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
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
        : 500;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as any).message || exception.message
        : 'Internal server error';

    // Standardized error format
    response.status(status).json({
      // status: 'error',
      status: status || 'error',
      timestamp: new Date().toISOString(),
      path: request.url,
      message: Array.isArray(message) ? message[0] : message,
    });
  }
}
