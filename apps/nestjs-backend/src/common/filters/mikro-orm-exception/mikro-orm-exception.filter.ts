/* eslint-disable complexity */
import {DriverException} from '@mikro-orm/core';
import {ArgumentsHost, Catch, ExceptionFilter, HttpStatus} from '@nestjs/common';
import {Request, Response} from 'express';
import {ErrorResponse} from './types/error-response.type';

@Catch(DriverException)
export class MikroOrmExceptionFilter<T extends DriverException> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const {code} = exception;

    const errorResponse: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database error occurred',
      timestamp: new Date().toISOString(),
      path: request.url,
      detail: exception.message,
    };

    switch (code) {
      // Class 23 - Integrity Constraint Violation
      case '23503': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'Foreign key constraint violation';
        break;
      }

      case '23505': {
        errorResponse.statusCode = HttpStatus.CONFLICT;
        errorResponse.message = 'Unique constraint violation';
        break;
      }

      case '23502': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'Required field is missing';
        break;
      }

      case '23514': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'Check constraint violation';
        break;
      }

      case '23000': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'Integrity constraint violation';
        break;
      }

      case '23001': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'Restrict violation';
        break;
      }

      case '23504': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'Foreign key violation: no action';
        break;
      }

      // Class 22 - Data Exception
      case '22000': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'Data exception';
        break;
      }

      case '22001': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'String data right truncation';
        break;
      }

      case '22003': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'Numeric value out of range';
        break;
      }

      case '22007': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'Invalid datetime format';
        break;
      }

      case '22008': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'Datetime field overflow';
        break;
      }

      case '22012': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'Division by zero';
        break;
      }

      case '22026': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'String data length mismatch';
        break;
      }

      // Class 42 - Syntax Error or Access Rule Violation
      case '42601': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'Syntax error';
        break;
      }

      case '42501': {
        errorResponse.statusCode = HttpStatus.FORBIDDEN;
        errorResponse.message = 'Insufficient privilege';
        break;
      }

      case '42602': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'Invalid name';
        break;
      }

      case '42622': {
        errorResponse.statusCode = HttpStatus.BAD_REQUEST;
        errorResponse.message = 'Name too long';
        break;
      }

      // Class 08 - Connection Exception
      case '08000': {
        errorResponse.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
        errorResponse.message = 'Connection exception';
        break;
      }

      case '08003': {
        errorResponse.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
        errorResponse.message = 'Connection does not exist';
        break;
      }

      case '08006': {
        errorResponse.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
        errorResponse.message = 'Connection failure';
        break;
      }

      // Class 53 - Insufficient Resources
      case '53000': {
        errorResponse.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
        errorResponse.message = 'Insufficient resources';
        break;
      }

      case '53100': {
        errorResponse.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
        errorResponse.message = 'Disk full';
        break;
      }

      case '53200': {
        errorResponse.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
        errorResponse.message = 'Out of memory';
        break;
      }

      case '53300': {
        errorResponse.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
        errorResponse.message = 'Too many connections';
        break;
      }

      // Class 40 - Transaction Rollback
      case '40001': {
        errorResponse.statusCode = HttpStatus.CONFLICT;
        errorResponse.message = 'Serialization failure';
        break;
      }

      case '40003': {
        errorResponse.statusCode = HttpStatus.CONFLICT;
        errorResponse.message = 'Statement completion unknown';
        break;
      }

      case undefined: {
        errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        errorResponse.message = 'An unexpected database error occurred';
        break;
      }

      default: {
        errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        errorResponse.message = 'An unexpected database error occurred';
      }
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}
