import {Request, Response} from 'express';

import {mock, MockProxy} from 'jest-mock-extended';

import {LoggerMiddleware} from './logger.middleware';
import {Logger} from './logger.service';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;
  let logger: MockProxy<Logger>;
  let req: MockProxy<Request>;
  let res: MockProxy<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    logger = mock<Logger>();
    middleware = new LoggerMiddleware(logger);

    req = mock<Request>();
    Object.defineProperty(req, 'ip', {value: '127.0.0.1'});
    Object.defineProperty(req, 'method', {value: 'GET'});
    Object.defineProperty(req, 'originalUrl', {value: '/test'});

    req.headers = {'user-agent': 'jest-test'};
    req.body = {test: 'data'};

    res = mock<Response>();
    res.statusCode = 200;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.on.mockImplementation((event: string, callback: (...args: any[]) => void) => {
      if (event === 'finish') {
        setTimeout(callback, 0); // simulate async
      }

      return res;
    });

    next = jest.fn();
  });

  it('should log a 2xx response', (done) => {
    res.statusCode = 200;

    middleware.use(req, res, next);

    setTimeout(() => {
      expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('[GET] /test - Status: 200 - IP: 127.0.0.1'));
      done();
    }, 10);
  });

  it('should warn on 4xx response', (done) => {
    res.statusCode = 404;

    middleware.use(req, res, next);

    setTimeout(() => {
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Status: 404'));
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Request Warning'));
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Request Header'));
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Request Body'));
      done();
    }, 10);
  });

  it('should error on 5xx response', (done) => {
    res.statusCode = 500;

    middleware.use(req, res, next);

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
    const err = new Error('Test error');

    // Extract the actual error handler
    res.on.mockImplementation((event, cb) => {
      if (event === 'error') {
        errorCallback.mockImplementation(() => {
          cb(err);
        });
      }

      return res;
    });

    middleware.use(req, res, next);
    errorCallback();

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Request Header'));
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Request Body'));
  });
});
