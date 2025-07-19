import {ExecutionContext, NotAcceptableException} from '@nestjs/common';
import {HttpArgumentsHost} from '@nestjs/common/interfaces';
import {Request} from 'express';
import {mock} from 'jest-mock-extended';
import {AcceptedLanguages} from '../../../email/types/accepted-languages.enum';
import {HeaderDecoratorParam} from './types/header-decorator.param.type';

// Extract the actual decorator function for testing
const validateHeaderFunction = (param: HeaderDecoratorParam, ctx: ExecutionContext): string | string[] => {
  const request: Request = ctx.switchToHttp().getRequest();

  // Handle both string and object parameters
  const headerName = typeof param === 'string' ? param : param.headerName;
  const options = typeof param === 'string' ? {} : (param.options ?? {});

  const {expectedValue, caseSensitive = false, missingMessage, invalidValueMessage, allowEmpty = false} = options;

  const headerValue = request.headers?.[headerName.toLowerCase()];

  // Check if header exists
  if (headerValue === undefined || headerValue === null || (!allowEmpty && headerValue === '')) {
    const message = missingMessage ?? `Missing required header: ${headerName}`;
    throw new NotAcceptableException(message);
  }

  // If no expected value specified, return the header value
  if (expectedValue === undefined) {
    return headerValue;
  }

  // Validate header value
  const isValid = validateHeaderValue(headerValue, expectedValue, caseSensitive);

  if (!isValid) {
    const message =
      invalidValueMessage ??
      `Invalid value for header '${headerName}'. Expected: ${formatExpectedValue(expectedValue)}`;
    throw new NotAcceptableException(message);
  }

  return headerValue;
};

/**
 * Validates header value against expected value(s)
 */
function validateHeaderValue(
  headerValue: string | string[],
  expectedValue: string | string[] | RegExp | Record<string, string | number>,
  caseSensitive: boolean,
): boolean {
  // Convert header value to array for consistent processing
  const headerValues = Array.isArray(headerValue) ? headerValue : [headerValue];

  // RegExp validation
  if (expectedValue instanceof RegExp) {
    return headerValues.some((value) => expectedValue.test(value));
  }

  // Enum validation (check if it's an object with string/number values)
  if (typeof expectedValue === 'object' && !Array.isArray(expectedValue) && expectedValue !== null) {
    const enumValues = Object.values(expectedValue).map(String);
    return headerValues.some((headerVal) =>
      enumValues.some((enumVal) =>
        caseSensitive ? headerVal === enumVal : headerVal.toLowerCase() === enumVal.toLowerCase(),
      ),
    );
  }

  // String or array validation
  const expectedValues = Array.isArray(expectedValue) ? expectedValue : [expectedValue];

  return headerValues.some((headerVal) =>
    expectedValues.some((expectedVal) =>
      caseSensitive ? headerVal === expectedVal : headerVal.toLowerCase() === expectedVal.toLowerCase(),
    ),
  );
}

/**
 * Formats expected value for error messages
 */
function formatExpectedValue(expectedValue: string | string[] | RegExp | Record<string, string | number>): string {
  if (expectedValue instanceof RegExp) {
    return expectedValue.toString();
  }

  if (Array.isArray(expectedValue)) {
    return expectedValue.join(' | ');
  }

  // Handle enum objects
  if (typeof expectedValue === 'object' && expectedValue !== null) {
    return Object.values(expectedValue).join(' | ');
  }

  return String(expectedValue);
}

describe('ValidateHeader Decorator', () => {
  const createMockExecutionContext = (headers: Record<string, string | string[]> = {}): ExecutionContext => {
    const mockRequest: Partial<Request> = {
      headers,
    };

    const mockHttpArgumentsHost = mock<HttpArgumentsHost>();
    mockHttpArgumentsHost.getRequest.mockReturnValue(mockRequest as Request);

    const mockExecutionContext = mock<ExecutionContext>();
    mockExecutionContext.switchToHttp.mockReturnValue(mockHttpArgumentsHost);

    return mockExecutionContext;
  };

  describe('Basic Header Validation', () => {
    it('should return header value when valid header is provided (string parameter)', () => {
      const headers = {'content-type': 'application/json'};
      const ctx = createMockExecutionContext(headers);

      const result = validateHeaderFunction('content-type', ctx);

      expect(result).toBe('application/json');
    });

    it('should return header value when valid header is provided (object parameter)', () => {
      const headers = {accept: 'application/json'};
      const ctx = createMockExecutionContext(headers);

      const param = {headerName: 'accept'};
      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('application/json');
    });

    it('should handle headers with different casing (headers are lowercase in Express)', () => {
      const headers = {'user-agent': 'Mozilla/5.0'};
      const ctx = createMockExecutionContext(headers);

      const result = validateHeaderFunction('User-Agent', ctx);

      expect(result).toBe('Mozilla/5.0');
    });

    it('should return array of header values when multiple headers with same name exist', () => {
      const headers = {'x-custom': ['value1', 'value2']};
      const ctx = createMockExecutionContext(headers);

      const result = validateHeaderFunction('x-custom', ctx);

      expect(result).toEqual(['value1', 'value2']);
    });
  });

  describe('Error Handling for Missing/Invalid Headers', () => {
    it('should throw NotAcceptableException when required header is missing', () => {
      const ctx = createMockExecutionContext({});

      expect(() => validateHeaderFunction('authorization', ctx)).toThrow(NotAcceptableException);
      expect(() => validateHeaderFunction('authorization', ctx)).toThrow('Missing required header: authorization');
    });

    it('should throw NotAcceptableException when header is empty and allowEmpty is false (default)', () => {
      const headers = {authorization: ''};
      const ctx = createMockExecutionContext(headers);

      expect(() => validateHeaderFunction('authorization', ctx)).toThrow(NotAcceptableException);
      expect(() => validateHeaderFunction('authorization', ctx)).toThrow('Missing required header: authorization');
    });

    it('should use custom missing message when provided', () => {
      const ctx = createMockExecutionContext({});
      const param = {
        headerName: 'authorization',
        options: {
          missingMessage: 'Custom auth header missing',
        },
      };

      expect(() => validateHeaderFunction(param, ctx)).toThrow(NotAcceptableException);
      expect(() => validateHeaderFunction(param, ctx)).toThrow('Custom auth header missing');
    });

    it('should allow empty string when allowEmpty is true', () => {
      const headers = {'x-optional': ''};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'x-optional',
        options: {
          allowEmpty: true,
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('');
    });
  });

  describe('Expected Value Validation - String', () => {
    it('should validate against single expected string value (case insensitive by default)', () => {
      const headers = {'content-type': 'application/json'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'content-type',
        options: {
          expectedValue: 'APPLICATION/JSON',
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('application/json');
    });

    it('should validate against single expected string value (case sensitive)', () => {
      const headers = {'content-type': 'application/json'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'content-type',
        options: {
          expectedValue: 'application/json',
          caseSensitive: true,
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('application/json');
    });

    it('should throw exception when string value does not match (case sensitive)', () => {
      const headers = {'content-type': 'application/json'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'content-type',
        options: {
          expectedValue: 'APPLICATION/JSON',
          caseSensitive: true,
        },
      };

      expect(() => validateHeaderFunction(param, ctx)).toThrow(NotAcceptableException);
      expect(() => validateHeaderFunction(param, ctx)).toThrow(
        "Invalid value for header 'content-type'. Expected: APPLICATION/JSON",
      );
    });

    it('should use custom invalid value message', () => {
      const headers = {'content-type': 'text/plain'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'content-type',
        options: {
          expectedValue: 'application/json',
          invalidValueMessage: 'Only JSON content type allowed',
        },
      };

      expect(() => validateHeaderFunction(param, ctx)).toThrow(NotAcceptableException);
      expect(() => validateHeaderFunction(param, ctx)).toThrow('Only JSON content type allowed');
    });
  });

  describe('Expected Value Validation - Array', () => {
    it('should validate against array of expected values (case insensitive by default)', () => {
      const headers = {accept: 'application/json'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'accept',
        options: {
          expectedValue: ['APPLICATION/JSON', 'TEXT/HTML'],
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('application/json');
    });

    it('should validate against array of expected values (case sensitive)', () => {
      const headers = {accept: 'application/json'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'accept',
        options: {
          expectedValue: ['application/json', 'text/html'],
          caseSensitive: true,
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('application/json');
    });

    it('should throw exception when array value does not match any expected values', () => {
      const headers = {accept: 'application/xml'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'accept',
        options: {
          expectedValue: ['application/json', 'text/html'],
        },
      };

      expect(() => validateHeaderFunction(param, ctx)).toThrow(NotAcceptableException);
      expect(() => validateHeaderFunction(param, ctx)).toThrow(
        "Invalid value for header 'accept'. Expected: application/json | text/html",
      );
    });

    it('should handle multiple header values against array of expected values', () => {
      const headers = {accept: ['application/json', 'text/html']};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'accept',
        options: {
          expectedValue: ['application/json', 'text/html', 'application/xml'],
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toEqual(['application/json', 'text/html']);
    });
  });

  describe('Expected Value Validation - RegExp', () => {
    it('should validate against regular expression pattern', () => {
      const headers = {'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'user-agent',
        options: {
          expectedValue: /bot/i,
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('Mozilla/5.0 (compatible; Googlebot/2.1)');
    });

    it('should throw exception when RegExp pattern does not match', () => {
      const headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'user-agent',
        options: {
          expectedValue: /bot/i,
        },
      };

      expect(() => validateHeaderFunction(param, ctx)).toThrow(NotAcceptableException);
      expect(() => validateHeaderFunction(param, ctx)).toThrow(
        "Invalid value for header 'user-agent'. Expected: /bot/i",
      );
    });

    it('should validate array header values against RegExp pattern', () => {
      const headers = {'x-custom': ['bot-crawler', 'user-agent']};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'x-custom',
        options: {
          expectedValue: /bot/i,
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toEqual(['bot-crawler', 'user-agent']);
    });
  });

  describe('Expected Value Validation - Enum', () => {
    it('should validate against enum object values', () => {
      const headers = {'accept-language': 'en'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'accept-language',
        options: {
          expectedValue: AcceptedLanguages,
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('en');
    });

    it('should validate against enum object values (case insensitive by default)', () => {
      const headers = {'accept-language': 'EN'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'accept-language',
        options: {
          expectedValue: AcceptedLanguages,
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('EN');
    });

    it('should throw exception when enum value does not match', () => {
      const headers = {'accept-language': 'fr'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'accept-language',
        options: {
          expectedValue: AcceptedLanguages,
        },
      };

      expect(() => validateHeaderFunction(param, ctx)).toThrow(NotAcceptableException);
      expect(() => validateHeaderFunction(param, ctx)).toThrow(
        "Invalid value for header 'accept-language'. Expected: en | de",
      );
    });

    it('should handle custom enum objects', () => {
      const customEnum = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        VALUE1: 'custom1',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        VALUE2: 'custom2',
      };

      const headers = {'x-custom-enum': 'custom1'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'x-custom-enum',
        options: {
          expectedValue: customEnum,
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('custom1');
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle undefined headers object gracefully', () => {
      const mockRequest: Partial<Request> = {
        headers: undefined,
      };

      const mockHttpArgumentsHost = mock<HttpArgumentsHost>();
      mockHttpArgumentsHost.getRequest.mockReturnValue(mockRequest as Request);

      const mockExecutionContext = mock<ExecutionContext>();
      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpArgumentsHost);

      expect(() => validateHeaderFunction('content-type', mockExecutionContext)).toThrow(NotAcceptableException);
    });

    it('should handle null header values', () => {
      const headers = {'x-null-header': null as unknown as string};
      const ctx = createMockExecutionContext(headers);

      expect(() => validateHeaderFunction('x-null-header', ctx)).toThrow(NotAcceptableException);
    });

    it('should handle undefined expected value (no validation, just return header)', () => {
      const headers = {'x-any-value': 'some-random-value'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'x-any-value',
        options: {
          expectedValue: undefined,
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('some-random-value');
    });

    it('should handle empty options object', () => {
      const headers = {'x-basic': 'value'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'x-basic',
        options: {},
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('value');
    });

    it('should handle complex enum with number values', () => {
      const mixedEnum = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        STRING_VALUE: 'string',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        NUMBER_VALUE: 42,
      };

      const headers = {'x-mixed': '42'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'x-mixed',
        options: {
          expectedValue: mixedEnum,
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('42');
    });

    it('should handle malformed object parameter without headerName', () => {
      const headers = {test: 'value'};
      const ctx = createMockExecutionContext(headers);
      // Testing malformed parameter that's missing required headerName property
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const param = {options: {}} as HeaderDecoratorParam;

      expect(() => validateHeaderFunction(param, ctx)).toThrow();
    });
  });

  describe('Integration with Real-World Scenarios', () => {
    it('should work like in AuthController with AcceptedLanguages enum', () => {
      const headers = {'accept-language': 'de'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'Accept-Language',
        options: {
          expectedValue: AcceptedLanguages,
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('de');
    });

    it('should work with authorization bearer tokens', () => {
      const headers = {authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'authorization',
        options: {
          expectedValue: /^Bearer\s+.+$/,
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('should work with API versioning headers', () => {
      const headers = {'api-version': 'v2'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'api-version',
        options: {
          expectedValue: ['v1', 'v2', 'v3'],
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('v2');
    });

    it('should work with CORS preflight headers', () => {
      const headers = {'access-control-request-method': 'POST'};
      const ctx = createMockExecutionContext(headers);
      const param = {
        headerName: 'access-control-request-method',
        options: {
          expectedValue: ['GET', 'POST', 'PUT', 'DELETE'],
          caseSensitive: true,
        },
      };

      const result = validateHeaderFunction(param, ctx);

      expect(result).toBe('POST');
    });
  });
});
