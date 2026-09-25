import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestWithId } from '../../common/middleware/request-id.middleware';

@Catch()
export class FailureResponseTransformer implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): Response {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    const requestId = request?.id || (response.getHeader('X-Request-ID') as string) || '';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected internal error occurred';
    let details: any = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resPayload = exception.getResponse() as any;

      if (typeof resPayload === 'string') {
        message = resPayload;
      } else if (typeof resPayload === 'object' && resPayload !== null) {
        message = resPayload.message || exception.message;
        code = resPayload.error || exception.name || 'HTTP_ERROR';
        if (Array.isArray(resPayload.message)) {
          message = resPayload.message.join('; ');
          details = { validationErrors: resPayload.message };
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name || 'ERROR';
    }

    return response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
      request_id: requestId,
    });
  }
}
