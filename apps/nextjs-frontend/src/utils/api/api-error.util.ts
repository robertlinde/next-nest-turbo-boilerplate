export class ApiError extends Error {
  response: Response;

  constructor(message: string, response: Response) {
    super(message);
    this.name = 'ApiError';
    this.response = response;
  }
}
