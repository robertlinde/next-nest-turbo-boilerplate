import {Request, Response} from 'express';
import {mock, MockProxy} from 'jest-mock-extended';
import {LoggerMiddleware} from './logger.middleware';
import {Logger} from './logger.service.ts';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;
  let logger: MockProxy<Logger>;
  let request: MockProxy<Request>;
  let response: MockProxy<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    logger = mock<Logger>();
    middleware = new LoggerMiddleware(logger);

    request = mock<Request>();
    Object.defineProperty(request, 'ip', {value: '127.0.0.1'});
    Object.defineProperty(request, 'method', {value: 'GET'});
    Object.defineProperty(request, 'originalUrl', {value: '/test'});

    request.headers = {'user-agent': 'jest-test'};
    request.body = {test: 'data'};

    response = mock<Response>();
    response.statusCode = 200;

    response.on.mockImplementation((event: string, callback: (...args: any[]) => void) => {
      if (event === 'finish') {
        setTimeout(callback, 0); // Simulate async
      }

      return response;
    });

    next = jest.fn();
  });

  it('should log a 2xx response', (done) => {
    response.statusCode = 200;

    middleware.use(request, response, next);

    setTimeout(() => {
      expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('[GET] /test - Status: 200 - IP: 127.0.0.1'));
      done();
    }, 10);
  });

  it('should warn on 4xx response', (done) => {
    response.statusCode = 404;

    middleware.use(request, response, next);

    setTimeout(() => {
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Status: 404'));
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Request Warning'));
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Request Header'));
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Request Body'));
      done();
    }, 10);
  });

  it('should error on 5xx response', (done) => {
    response.statusCode = 500;

    middleware.use(request, response, next);

    setTimeout(() => {
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Status: 500'));
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Request Error'));
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Request Header'));
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Request Body'));
      done();
    }, 10);
  });

  it('should log error event on response', () => {
    const errorCallback = jest.fn();
    const error = new Error('Test error');

    // Extract the actual error handler
    response.on.mockImplementation((event, cb) => {
      if (event === 'error') {
        errorCallback.mockImplementation(() => {
          cb(error);
        });
      }

      return response;
    });

    middleware.use(request, response, next);
    errorCallback();

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Request Header'));
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Request Body'));
  });
});
