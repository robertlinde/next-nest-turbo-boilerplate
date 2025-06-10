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

  use(req: Request, response: Response, next: () => void): void {
    const {ip, method, originalUrl} = req;
    const startTime = Date.now();
    const requestHeader = JSON.stringify(req.headers);
    const requestBody = JSON.stringify(req.body);

    response.on('finish', () => {
      const duration = Date.now() - startTime;

      if (response.statusCode >= 200 && response.statusCode < 400) {
        this.logger.log(`[${method}] ${originalUrl} - Status: ${response.statusCode} - IP: ${ip} - ${duration}ms`);
      } else if (response.statusCode >= 400 && response.statusCode < 500) {
        this.logger.warn(`[${method}] ${originalUrl} - Status: ${response.statusCode} - IP: ${ip} - ${duration}ms`);
        this.logger.warn(`Request Warning: ${req.method} ${req.originalUrl} - Status: ${response.statusCode}`);
        this.logger.warn(`Request Header: ${requestHeader}`);
        this.logger.warn(`Request Body: ${requestBody}`);
      } else if (response.statusCode >= 500) {
        this.logger.error(`[${method}] ${originalUrl} - Status: ${response.statusCode} - IP: ${ip} - ${duration}ms`);
        this.logger.error(`Request Error: ${req.method} ${req.originalUrl} - Status: ${response.statusCode}`);
        this.logger.error(`Request Header: ${requestHeader}`);
        this.logger.error(`Request Body: ${requestBody}`);
      }
    });

    response.on('error', (err) => {
      const duration = Date.now() - startTime;

      this.logger.error(`[${method}] ${originalUrl} - IP: ${ip} - ${duration}ms - Error: ${err.message}`);
      this.logger.error(`Request Header: ${requestHeader}`);
      this.logger.error(`Request Body: ${requestBody}`);
    });

    next();
  }
}
