import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import type { Response } from 'express'
import { BusinessError } from './BusinessError.js'

/// imported through app.useGlobalFilters(new GlobalExceptionFilter()); in  App.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    ///////////////
    /// L'exception est gerée de manière globale
    ///////////////
    if (exception instanceof BusinessError) {
      const { message } = exception
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        code: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
        path: ctx.getRequest().url,
      })
      ///////////////
      ///////////////
    } else if (exception instanceof HttpException) {
      // Handle other HTTP exceptions
      const status = exception.getStatus()
      const message = exception.getResponse()
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: ctx.getRequest().url,
      })
    } else {
      // Default for unexpected errors
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        path: ctx.getRequest().url,
      })
    }
  }
}
