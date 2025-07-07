import { HttpStatus } from '@nestjs/common';
import { Expose, Type } from 'class-transformer';

interface ErrorResponse {
  error?: string;
  message: string | string[];
  details?: Record<string, any>;
}

export class HttpResponse<T> {
  @Expose()
  private readonly statusCode: number;

  @Expose()
  private readonly message: string;

  @Expose()
  @Type((options) => options.newObject.resultType)
  private readonly result?: T;

  @Expose()
  private readonly error?: ErrorResponse;

  private constructor(statusCode: number, message: string, result?: T, error?: ErrorResponse) {
    this.statusCode = statusCode;
    this.message = message;
    this.result = result;
    this.error = error;
  }

  // // Getter methods
  // get _statusCode(): number {
  //   return this.statusCode;
  // }

  // get _message(): string {
  //   return this.message;
  // }

  // get _result(): T | undefined {
  //   return this.result;
  // }

  // get _error(): ErrorResponse | undefined {
  //   return this.error;
  // }

  // Success responses
  static ok<T>(result?: T, message: string = 'OK'): HttpResponse<T> {
    return new HttpResponse(HttpStatus.OK, message, result);
  }

  static created<T>(result?: T, message: string = 'Created'): HttpResponse<T> {
    return new HttpResponse(HttpStatus.CREATED, message, result);
  }

  static noContent<T>(): HttpResponse<T> {
    return new HttpResponse(HttpStatus.NO_CONTENT, 'No Content');
  }

  // Error responses
  static badRequest<T>(message: string = 'Bad Request', error?: ErrorResponse): HttpResponse<T> {
    return new HttpResponse(HttpStatus.BAD_REQUEST, message, undefined, error);
  }

  static unauthorized<T>(message: string = 'Unauthorized', error?: ErrorResponse): HttpResponse<T> {
    return new HttpResponse(HttpStatus.UNAUTHORIZED, message, undefined, error);
  }

  static notFound<T>(message: string = 'Not Found', error?: ErrorResponse): HttpResponse<T> {
    return new HttpResponse(HttpStatus.NOT_FOUND, message, undefined, error);
  }

  static unprocessableEntity<T>(message: string = 'Unprocessable Entity', error?: ErrorResponse): HttpResponse<T> {
    return new HttpResponse(HttpStatus.UNPROCESSABLE_ENTITY, message, undefined, error);
  }

  static internalServerError<T>(message: string = 'Internal Server Error', error?: ErrorResponse): HttpResponse<T> {
    return new HttpResponse(HttpStatus.INTERNAL_SERVER_ERROR, message, undefined, error);
  }

  // Generic error response with custom status code
  static error<T>(statusCode: number, message: string, error?: ErrorResponse): HttpResponse<T> {
    return new HttpResponse(statusCode, message, undefined, error);
  }
}
