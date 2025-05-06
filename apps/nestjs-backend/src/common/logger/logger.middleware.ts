import {Injectable, NestMiddleware} from '@nestjs/common';

import {Request, Response} from 'express';

import {Logger} from './logger.service';

/**
 * Logger middleware
 *
 * Logs the request method, URL, IP, and duration of the request
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {
    logger.setContext(LoggerMiddleware.name);
  }

  use(req: Request, res: Response, next: () => void): void {
    const {ip, method, originalUrl} = req;
    const startTime = Date.now();
    let requestHeader = '';
    let requestBody = '';

    if (req.headers) {
      requestHeader = JSON.stringify(req.headers);
    }

    if (req.body) {
      requestBody = JSON.stringify(req.body);
    }

    res.on('finish', () => {
      const duration = Date.now() - startTime;

      if (res.statusCode >= 200 && res.statusCode < 400) {
        this.logger.log(`[${method}] ${originalUrl} - Status: ${res.statusCode} - IP: ${ip} - ${duration}ms`);
      } else if (res.statusCode >= 400 && res.statusCode < 500) {
        this.logger.warn(`[${method}] ${originalUrl} - Status: ${res.statusCode} - IP: ${ip} - ${duration}ms`);
        this.logger.warn(`Request Warning: ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
        this.logger.warn(`Request Header: ${requestHeader}`);
        this.logger.warn(`Request Body: ${requestBody}`);
      } else if (res.statusCode >= 500) {
        this.logger.error(`[${method}] ${originalUrl} - Status: ${res.statusCode} - IP: ${ip} - ${duration}ms`);
        this.logger.error(`Request Error: ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
        this.logger.error(`Request Header: ${requestHeader}`);
        this.logger.error(`Request Body: ${requestBody}`);
      }
    });

    res.on('error', (err) => {
      const duration = Date.now() - startTime;

      this.logger.error(`[${method}] ${originalUrl} - IP: ${ip} - ${duration}ms - Error: ${err.message}`);
      this.logger.error(`Request Header: ${requestHeader}`);
      this.logger.error(`Request Body: ${requestBody}`);
    });

    next();
  }
}
