import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RequestWithId } from '../../common/middleware/request-id.middleware';

@Injectable()
export class SuccessResponseTransformer implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<RequestWithId>();
    const res = httpContext.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // If response is already custom-handled (e.g. streaming CSV), pass through directly
        if (res.headersSent || (res.getHeader('content-type') && String(res.getHeader('content-type')).includes('text/csv'))) {
          return data;
        }

        const requestId = req?.id || res.getHeader('X-Request-ID') || '';

        return {
          success: true,
          data: data !== undefined ? data : null,
          request_id: requestId,
        };
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }
}
