import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((res) => ({
        status: 'success',
        ...(res && typeof res === 'object' && 'data' in res
          ? res
          : { data: res }),
        message: res?.message || 'Request processed successfully',
      })),
    );
  }
}