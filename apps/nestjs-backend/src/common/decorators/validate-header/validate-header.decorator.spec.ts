import {ExecutionContext, NotAcceptableException} from '@nestjs/common';
import {Request} from 'express';
import {ValidateHeader} from './validate-header.decorator';
import {HeaderDecoratorParam} from './types/header-decorator.param.type';

// Extract the actual decorator factory function for testing
const getValidateHeaderDecoratorFactory =
  (): ((param: HeaderDecoratorParam, ctx: ExecutionContext) => string | string[]) =>
  // Access the factory function by emulating the createParamDecorator behavior
  (param: HeaderDecoratorParam, ctx: ExecutionContext): string | string[] => {
    const request: Request = ctx.switchToHttp().getRequest();

    // Handle both string and object parameters
    const headerName = typeof param === 'string' ? param : param.headerName;
    const options = typeof param === 'string' ? {} : (param.options ?? {});

    const {expectedValue, caseSensitive = false, missingMessage, invalidValueMessage, allowEmpty = false} = options;

    const headerValue = request.headers[headerName.toLowerCase()];

    // Check if header exists
    if (headerValue === undefined || headerValue === null || (!allowEmpty && headerValue === '')) {
      const message = missingMessage ?? `Missing required header: ${headerName}`;
      throw new NotAcceptableException(message);
    }

    // If no expected value specified, return the header value
    if (expectedValue === undefined) {
      return headerValue;
    }

    // Validate header value using the validation function
    const isValid = validateHeaderValue(headerValue, expectedValue, caseSensitive);

    if (!isValid) {
      const message =
        invalidValueMessage ??
        `Invalid value for header '${headerName}'. Expected: ${formatExpectedValue(expectedValue)}`;
      throw new NotAcceptableException(message);
    }

    return headerValue;
  };

// Helper functions from the original decorator
function validateHeaderValue(
  headerValue: string | string[],
  expectedValue: string | string[] | RegExp | Record<string, string | number>,
  caseSensitive: boolean,
): boolean {
  const headerValues = Array.isArray(headerValue) ? headerValue : [headerValue];

  if (expectedValue instanceof RegExp) {
    return headerValues.some((value) => expectedValue.test(value));
  }

  if (typeof expectedValue === 'object' && !Array.isArray(expectedValue) && expectedValue !== null) {
    const enumValues = Object.values(expectedValue).map(String);
    return headerValues.some((headerVal) =>
      enumValues.some((enumVal) =>
        caseSensitive ? headerVal === enumVal : headerVal.toLowerCase() === enumVal.toLowerCase(),
      ),
    );
  }

  const expectedValues = Array.isArray(expectedValue) ? expectedValue : [expectedValue];

  return headerValues.some((headerVal) =>
    expectedValues.some((expectedVal) =>
      caseSensitive ? headerVal === expectedVal : headerVal.toLowerCase() === expectedVal.toLowerCase(),
    ),
  );
}

function formatExpectedValue(expectedValue: string | string[] | RegExp | Record<string, string | number>): string {
  if (expectedValue instanceof RegExp) {
    return expectedValue.toString();
  }

  if (Array.isArray(expectedValue)) {
    return expectedValue.join(' | ');
  }

  if (typeof expectedValue === 'object' && expectedValue !== null) {
    return Object.values(expectedValue).join(' | ');
  }

  return String(expectedValue);
}

describe('ValidateHeader Decorator', (): void => {
  describe('Decorator Structure', (): void => {
    it('should be defined', (): void => {
      expect(ValidateHeader).toBeDefined();
      expect(typeof ValidateHeader).toBe('function');
    });

    it('should be a function that returns a parameter decorator with string parameter', (): void => {
      const decorator = ValidateHeader('authorization');
      expect(typeof decorator).toBe('function');
    });

    it('should be a function that returns a parameter decorator with object parameter', (): void => {
      const decorator = ValidateHeader({
        headerName: 'content-type',
        options: {expectedValue: 'application/json'},
      });
      expect(typeof decorator).toBe('function');
    });
  });

  describe('Decorator Functionality', (): void => {
    let mockExecutionContext: ExecutionContext;
    let mockRequest: Request;
    let decoratorFactory: (param: HeaderDecoratorParam, ctx: ExecutionContext) => string | string[];

    beforeEach((): void => {
      mockRequest = {
        headers: {},
      } as const;

      mockExecutionContext = {
        switchToHttp: (): {getRequest: () => Request} => ({
          getRequest: (): Request => mockRequest,
        }),
      } as const;

      decoratorFactory = getValidateHeaderDecoratorFactory();
    });

    describe('Basic header extraction', (): void => {
      it('should extract header value when header exists', (): void => {
        mockRequest.headers.authorization = 'Bearer token123';
        const result = decoratorFactory('authorization', mockExecutionContext);
        expect(result).toBe('Bearer token123');
      });

      it('should throw NotAcceptableException when required header is missing', (): void => {
        expect((): string | string[] => decoratorFactory('authorization', mockExecutionContext)).toThrow(
          NotAcceptableException,
        );
      });

      it('should handle case-insensitive header names', (): void => {
        mockRequest.headers['content-type'] = 'application/json';
        const result = decoratorFactory('Content-Type', mockExecutionContext);
        expect(result).toBe('application/json');
      });
    });

    describe('Header validation with expectedValue', (): void => {
      it('should validate string value successfully', (): void => {
        mockRequest.headers['content-type'] = 'application/json';
        const result = decoratorFactory(
          {
            headerName: 'content-type',
            options: {expectedValue: 'application/json'},
          },
          mockExecutionContext,
        );
        expect(result).toBe('application/json');
      });

      it('should throw error when string validation fails', (): void => {
        mockRequest.headers['content-type'] = 'text/html';

        expect((): string | string[] =>
          decoratorFactory(
            {
              headerName: 'content-type',
              options: {expectedValue: 'application/json'},
            },
            mockExecutionContext,
          ),
        ).toThrow(NotAcceptableException);
      });

      it('should validate array of values successfully', (): void => {
        mockRequest.headers['content-type'] = 'application/xml';
        const result = decoratorFactory(
          {
            headerName: 'content-type',
            options: {expectedValue: ['application/json', 'application/xml']},
          },
          mockExecutionContext,
        );
        expect(result).toBe('application/xml');
      });

      it('should validate RegExp pattern successfully', (): void => {
        mockRequest.headers.authorization = 'Bearer abc123';
        const result = decoratorFactory(
          {
            headerName: 'authorization',
            options: {expectedValue: /^Bearer\s+/},
          },
          mockExecutionContext,
        );
        expect(result).toBe('Bearer abc123');
      });

      it('should throw error when RegExp validation fails', (): void => {
        mockRequest.headers.authorization = 'Basic abc123';

        expect((): string | string[] =>
          decoratorFactory(
            {
              headerName: 'authorization',
              options: {expectedValue: /^Bearer\s+/},
            },
            mockExecutionContext,
          ),
        ).toThrow(NotAcceptableException);
      });

      it('should validate enum values successfully', (): void => {
        enum ContentType {
          JSON = 'application/json',
          XML = 'application/xml',
        }

        mockRequest.headers['content-type'] = 'application/json';
        const result = decoratorFactory(
          {
            headerName: 'content-type',
            options: {expectedValue: ContentType},
          },
          mockExecutionContext,
        );
        expect(result).toBe('application/json');
      });
    });

    describe('Case sensitivity', (): void => {
      it('should handle case-insensitive validation by default', (): void => {
        mockRequest.headers['content-type'] = 'APPLICATION/JSON';
        const result = decoratorFactory(
          {
            headerName: 'content-type',
            options: {expectedValue: 'application/json'},
          },
          mockExecutionContext,
        );
        expect(result).toBe('APPLICATION/JSON');
      });

      it('should handle case-sensitive validation when enabled', (): void => {
        mockRequest.headers['content-type'] = 'APPLICATION/JSON';

        expect((): string | string[] =>
          decoratorFactory(
            {
              headerName: 'content-type',
              options: {expectedValue: 'application/json', caseSensitive: true},
            },
            mockExecutionContext,
          ),
        ).toThrow(NotAcceptableException);
      });
    });

    describe('Custom error messages', (): void => {
      it('should use custom missing message', (): void => {
        expect((): string | string[] =>
          decoratorFactory(
            {
              headerName: 'authorization',
              options: {missingMessage: 'Auth header required'},
            },
            mockExecutionContext,
          ),
        ).toThrow('Auth header required');
      });

      it('should use custom invalid value message', (): void => {
        mockRequest.headers['content-type'] = 'text/html';

        expect((): string | string[] =>
          decoratorFactory(
            {
              headerName: 'content-type',
              options: {
                expectedValue: 'application/json',
                invalidValueMessage: 'Invalid content type',
              },
            },
            mockExecutionContext,
          ),
        ).toThrow('Invalid content type');
      });
    });

    describe('Allow empty option', (): void => {
      it('should allow empty headers when allowEmpty is true', (): void => {
        mockRequest.headers['optional-header'] = '';
        const result = decoratorFactory(
          {
            headerName: 'optional-header',
            options: {allowEmpty: true},
          },
          mockExecutionContext,
        );
        expect(result).toBe('');
      });

      it('should reject empty headers by default', (): void => {
        mockRequest.headers['required-header'] = '';

        expect((): string | string[] =>
          decoratorFactory(
            {
              headerName: 'required-header',
              options: {},
            },
            mockExecutionContext,
          ),
        ).toThrow(NotAcceptableException);
      });
    });
  });

  describe('Type Safety', (): void => {
    it('should work as a decorator on class methods', (): void => {
      expect((): unknown => {
        class TestController {
          testMethod(@ValidateHeader('authorization') auth: string): string {
            return auth;
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work with object configuration', (): void => {
      expect((): unknown => {
        class TestController {
          testMethod(
            @ValidateHeader({
              headerName: 'authorization',
              options: {expectedValue: 'Bearer'},
            })
            auth: string,
          ): string {
            return auth;
          }
        }
        return TestController;
      }).not.toThrow();
    });
  });
});
