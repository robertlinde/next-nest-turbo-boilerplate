import {HttpStatus} from '@nestjs/common';

export type ErrorResponse = {
  statusCode: HttpStatus;
  message: string;
  timestamp: string;
  path: string;
  detail: string;
};
