import {DriverException} from '@mikro-orm/core';
import {ArgumentsHost, HttpStatus} from '@nestjs/common';
import {HttpArgumentsHost} from '@nestjs/common/interfaces';
import {Request, Response} from 'express';
import {mock, MockProxy} from 'jest-mock-extended';
import {MikroOrmExceptionFilter} from './mikro-orm-exception.filter';

describe('MikroOrmExceptionFilter', () => {
  let filter: MikroOrmExceptionFilter<DriverException>;
  let mockRequest: MockProxy<Request>;
  let mockResponse: MockProxy<Response>;
  let mockHttpArgumentsHost: MockProxy<HttpArgumentsHost>;
  let mockArgumentsHost: MockProxy<ArgumentsHost>;

  beforeEach(() => {
    filter = new MikroOrmExceptionFilter();

    mockRequest = mock<Request>();
    mockResponse = mock<Response>();
    mockResponse.status.mockReturnValue(mockResponse); // for chaining

    mockHttpArgumentsHost = mock<HttpArgumentsHost>();
    mockHttpArgumentsHost.getRequest.mockReturnValue(mockRequest);
    mockHttpArgumentsHost.getResponse.mockReturnValue(mockResponse);

    mockArgumentsHost = mock<ArgumentsHost>();
    mockArgumentsHost.switchToHttp.mockReturnValue(mockHttpArgumentsHost);

    mockRequest.url = '/test-url';
  });

  it.each([
    ['23505', HttpStatus.CONFLICT, 'Unique constraint violation'],
    ['23503', HttpStatus.BAD_REQUEST, 'Foreign key constraint violation'],
    ['23502', HttpStatus.BAD_REQUEST, 'Required field is missing'],
    ['23514', HttpStatus.BAD_REQUEST, 'Check constraint violation'],
    ['23000', HttpStatus.BAD_REQUEST, 'Integrity constraint violation'],
    ['23001', HttpStatus.BAD_REQUEST, 'Restrict violation'],
    ['23504', HttpStatus.BAD_REQUEST, 'Foreign key violation: no action'],
    ['22000', HttpStatus.BAD_REQUEST, 'Data exception'],
    ['22001', HttpStatus.BAD_REQUEST, 'String data right truncation'],
    ['22003', HttpStatus.BAD_REQUEST, 'Numeric value out of range'],
    ['22007', HttpStatus.BAD_REQUEST, 'Invalid datetime format'],
    ['22008', HttpStatus.BAD_REQUEST, 'Datetime field overflow'],
    ['22012', HttpStatus.BAD_REQUEST, 'Division by zero'],
    ['22026', HttpStatus.BAD_REQUEST, 'String data length mismatch'],
    ['42601', HttpStatus.BAD_REQUEST, 'Syntax error'],
    ['42501', HttpStatus.FORBIDDEN, 'Insufficient privilege'],
    ['42602', HttpStatus.BAD_REQUEST, 'Invalid name'],
    ['42622', HttpStatus.BAD_REQUEST, 'Name too long'],
    ['08000', HttpStatus.SERVICE_UNAVAILABLE, 'Connection exception'],
    ['08003', HttpStatus.SERVICE_UNAVAILABLE, 'Connection does not exist'],
    ['08006', HttpStatus.SERVICE_UNAVAILABLE, 'Connection failure'],
    ['53000', HttpStatus.SERVICE_UNAVAILABLE, 'Insufficient resources'],
    ['53100', HttpStatus.SERVICE_UNAVAILABLE, 'Disk full'],
    ['53200', HttpStatus.SERVICE_UNAVAILABLE, 'Out of memory'],
    ['53300', HttpStatus.SERVICE_UNAVAILABLE, 'Too many connections'],
    ['40001', HttpStatus.CONFLICT, 'Serialization failure'],
    ['40003', HttpStatus.CONFLICT, 'Statement completion unknown'],
    [undefined, HttpStatus.INTERNAL_SERVER_ERROR, 'An unexpected database error occurred'],
    ['unknown_code', HttpStatus.INTERNAL_SERVER_ERROR, 'An unexpected database error occurred'],
  ])(
    'handles exception with code %s correctly',
    (code: string | undefined, expectedStatus: number, expectedMessage: string) => {
      const exception: DriverException = {
        name: 'DriverException',
        code,
        message: 'Sample DB error',
      };

      // eslint-disable-next-line promise/valid-params, promise/prefer-await-to-then
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(expectedStatus);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: expectedStatus,
          message: expectedMessage,
          path: '/test-url',
          detail: 'Sample DB error',
        }),
      );
    },
  );
});
