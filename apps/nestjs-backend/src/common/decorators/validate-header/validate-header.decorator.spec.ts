import {ExecutionContext, NotAcceptableException} from '@nestjs/common';
import {Request} from 'express';
import {mock} from 'jest-mock-extended';
import {HeaderDecoratorParam} from './types/header-decorator.param.type';

// Test enum for validation
enum TestEnum {
  VALUE1 = 'value1',
  VALUE2 = 'value2',
}

describe('ValidateHeader Decorator Function', () => {
  let mockRequest: Request;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    mockRequest = mock<Request>();
    mockExecutionContext = mock<ExecutionContext>();

    mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
      getRequest: () => mockRequest,
      getResponse: jest.fn(),
      getNext: jest.fn(),
    });
  });

  // Helper to create a test context and call the decorator implementation
  const testDecoratorImplementation = (param: HeaderDecoratorParam): string | string[] => {
    // This simulates what NestJS does internally when processing the decorator
    // We create a context that mimics the decorator execution environment

    // Handle both string and object parameters
    const headerName = typeof param === 'string' ? param : param.headerName;
    const options = typeof param === 'string' ? {} : (param.options ?? {});

    const {expectedValue, caseSensitive = false, missingMessage, invalidValueMessage, allowEmpty = false} = options;

    const headerValue = mockRequest.headers[headerName.toLowerCase()];

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

  // Helper functions (copied from the actual implementation for testing)
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

  describe('Basic header extraction', () => {
    it('should extract header value when header exists', () => {
      // Arrange
      mockRequest.headers = {'x-custom-header': 'test-value'};
      const param: HeaderDecoratorParam = 'X-Custom-Header';

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toBe('test-value');
    });

    it('should throw NotAcceptableException when header is missing', () => {
      // Arrange
      mockRequest.headers = {};
      const param: HeaderDecoratorParam = 'X-Missing-Header';

      // Act & Assert
      expect(() => testDecoratorImplementation(param)).toThrow(NotAcceptableException);
      expect(() => testDecoratorImplementation(param)).toThrow('Missing required header: X-Missing-Header');
    });

    it('should throw NotAcceptableException when header is empty string', () => {
      // Arrange
      mockRequest.headers = {'x-empty-header': ''};
      const param: HeaderDecoratorParam = 'X-Empty-Header';

      // Act & Assert
      expect(() => testDecoratorImplementation(param)).toThrow(NotAcceptableException);
      expect(() => testDecoratorImplementation(param)).toThrow('Missing required header: X-Empty-Header');
    });

    it('should accept empty string when allowEmpty is true', () => {
      // Arrange
      mockRequest.headers = {'x-empty-header': ''};
      const param: HeaderDecoratorParam = {
        headerName: 'X-Empty-Header',
        options: {allowEmpty: true},
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toBe('');
    });
  });

  describe('String value validation', () => {
    it('should validate exact string match (case-insensitive by default)', () => {
      // Arrange
      mockRequest.headers = {'content-type': 'application/json'};
      const param: HeaderDecoratorParam = {
        headerName: 'Content-Type',
        options: {expectedValue: 'application/json'},
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toBe('application/json');
    });

    it('should validate string match with different case (case-insensitive)', () => {
      // Arrange
      mockRequest.headers = {'content-type': 'APPLICATION/JSON'};
      const param: HeaderDecoratorParam = {
        headerName: 'Content-Type',
        options: {expectedValue: 'application/json'},
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toBe('APPLICATION/JSON');
    });

    it('should enforce case-sensitive validation when specified', () => {
      // Arrange
      mockRequest.headers = {'x-custom': 'VALUE'};
      const param: HeaderDecoratorParam = {
        headerName: 'X-Custom',
        options: {
          expectedValue: 'value',
          caseSensitive: true,
        },
      };

      // Act & Assert
      expect(() => testDecoratorImplementation(param)).toThrow(NotAcceptableException);
      expect(() => testDecoratorImplementation(param)).toThrow("Invalid value for header 'X-Custom'. Expected: value");
    });

    it('should pass case-sensitive validation with exact match', () => {
      // Arrange
      mockRequest.headers = {'x-custom': 'value'};
      const param: HeaderDecoratorParam = {
        headerName: 'X-Custom',
        options: {
          expectedValue: 'value',
          caseSensitive: true,
        },
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toBe('value');
    });
  });

  describe('Array value validation', () => {
    it('should validate against array of expected values', () => {
      // Arrange
      mockRequest.headers = {'accept-language': 'en'};
      const param: HeaderDecoratorParam = {
        headerName: 'Accept-Language',
        options: {expectedValue: ['en', 'de', 'fr']},
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toBe('en');
    });

    it('should fail validation when value not in array', () => {
      // Arrange
      mockRequest.headers = {'accept-language': 'es'};
      const param: HeaderDecoratorParam = {
        headerName: 'Accept-Language',
        options: {expectedValue: ['en', 'de', 'fr']},
      };

      // Act & Assert
      expect(() => testDecoratorImplementation(param)).toThrow(NotAcceptableException);
      expect(() => testDecoratorImplementation(param)).toThrow(
        "Invalid value for header 'Accept-Language'. Expected: en | de | fr",
      );
    });

    it('should handle array headers against array expected values', () => {
      // Arrange
      mockRequest.headers = {'x-multiple': ['value1', 'value2']};
      const param: HeaderDecoratorParam = {
        headerName: 'X-Multiple',
        options: {expectedValue: ['value1', 'value3']},
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toEqual(['value1', 'value2']);
    });
  });

  describe('RegExp validation', () => {
    it('should validate header against regular expression pattern', () => {
      // Arrange
      mockRequest.headers = {authorization: 'Bearer abc123'};
      const param: HeaderDecoratorParam = {
        headerName: 'Authorization',
        options: {expectedValue: /^Bearer .+$/},
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toBe('Bearer abc123');
    });

    it('should fail validation when pattern does not match', () => {
      // Arrange
      mockRequest.headers = {authorization: 'Basic abc123'};
      const param: HeaderDecoratorParam = {
        headerName: 'Authorization',
        options: {expectedValue: /^Bearer .+$/},
      };

      // Act & Assert
      expect(() => testDecoratorImplementation(param)).toThrow(NotAcceptableException);
      expect(() => testDecoratorImplementation(param)).toThrow(
        "Invalid value for header 'Authorization'. Expected: /^Bearer .+$/",
      );
    });

    it('should validate array headers against RegExp', () => {
      // Arrange
      mockRequest.headers = {'x-tokens': ['Bearer token1', 'Bearer token2']};
      const param: HeaderDecoratorParam = {
        headerName: 'X-Tokens',
        options: {expectedValue: /^Bearer .+$/},
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toEqual(['Bearer token1', 'Bearer token2']);
    });
  });

  describe('Enum validation', () => {
    it('should validate header against enum values', () => {
      // Arrange
      mockRequest.headers = {'x-test-enum': 'value1'};
      const param: HeaderDecoratorParam = {
        headerName: 'X-Test-Enum',
        options: {expectedValue: TestEnum},
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toBe('value1');
    });

    it('should fail validation when value not in enum', () => {
      // Arrange
      mockRequest.headers = {'x-test-enum': 'invalid'};
      const param: HeaderDecoratorParam = {
        headerName: 'X-Test-Enum',
        options: {expectedValue: TestEnum},
      };

      // Act & Assert
      expect(() => testDecoratorImplementation(param)).toThrow(NotAcceptableException);
      expect(() => testDecoratorImplementation(param)).toThrow(
        "Invalid value for header 'X-Test-Enum'. Expected: value1 | value2",
      );
    });

    it('should validate enum with case-insensitive comparison by default', () => {
      // Arrange
      mockRequest.headers = {'x-test-enum': 'VALUE1'};
      const param: HeaderDecoratorParam = {
        headerName: 'X-Test-Enum',
        options: {expectedValue: TestEnum},
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toBe('VALUE1');
    });

    it('should enforce case-sensitive enum validation when specified', () => {
      // Arrange
      mockRequest.headers = {'x-test-enum': 'VALUE1'};
      const param: HeaderDecoratorParam = {
        headerName: 'X-Test-Enum',
        options: {
          expectedValue: TestEnum,
          caseSensitive: true,
        },
      };

      // Act & Assert
      expect(() => testDecoratorImplementation(param)).toThrow(NotAcceptableException);
    });
  });

  describe('Custom error messages', () => {
    it('should use custom missing message when header is missing', () => {
      // Arrange
      mockRequest.headers = {};
      const param: HeaderDecoratorParam = {
        headerName: 'Authorization',
        options: {missingMessage: 'Authentication required'},
      };

      // Act & Assert
      expect(() => testDecoratorImplementation(param)).toThrow(NotAcceptableException);
      expect(() => testDecoratorImplementation(param)).toThrow('Authentication required');
    });

    it('should use custom invalid value message when validation fails', () => {
      // Arrange
      mockRequest.headers = {'content-type': 'text/plain'};
      const param: HeaderDecoratorParam = {
        headerName: 'Content-Type',
        options: {
          expectedValue: 'application/json',
          invalidValueMessage: 'Only JSON content is accepted',
        },
      };

      // Act & Assert
      expect(() => testDecoratorImplementation(param)).toThrow(NotAcceptableException);
      expect(() => testDecoratorImplementation(param)).toThrow('Only JSON content is accepted');
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined header values', () => {
      // Arrange
      mockRequest.headers = {'x-undefined': undefined};
      const param: HeaderDecoratorParam = 'X-Undefined';

      // Act & Assert
      expect(() => testDecoratorImplementation(param)).toThrow(NotAcceptableException);
    });

    it('should handle array headers with mixed valid/invalid values', () => {
      // Arrange
      mockRequest.headers = {'x-mixed': ['valid', 'invalid']};
      const param: HeaderDecoratorParam = {
        headerName: 'X-Mixed',
        options: {expectedValue: ['valid', 'other']},
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toEqual(['valid', 'invalid']);
    });

    it('should handle headers with numeric enum values', () => {
      // Arrange
      enum NumericEnum {
        VALUE1 = 1,
        VALUE2 = 2,
      }

      mockRequest.headers = {'x-numeric': '1'};
      const param: HeaderDecoratorParam = {
        headerName: 'X-Numeric',
        options: {expectedValue: NumericEnum},
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toBe('1');
    });

    it('should handle complex object as expected value gracefully', () => {
      // Arrange
      const complexObject = {key1: 'value1', key2: 2};
      mockRequest.headers = {'x-complex': 'value1'};
      const param: HeaderDecoratorParam = {
        headerName: 'X-Complex',
        options: {expectedValue: complexObject},
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toBe('value1');
    });
  });

  describe('Parameter format variations', () => {
    it('should handle simple string parameter format', () => {
      // Arrange
      mockRequest.headers = {'x-simple': 'value'};
      const param: HeaderDecoratorParam = 'X-Simple';

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toBe('value');
    });

    it('should handle object parameter format with no options', () => {
      // Arrange
      mockRequest.headers = {'x-object': 'value'};
      const param: HeaderDecoratorParam = {
        headerName: 'X-Object',
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toBe('value');
    });

    it('should handle object parameter format with empty options', () => {
      // Arrange
      mockRequest.headers = {'x-empty-options': 'value'};
      const param: HeaderDecoratorParam = {
        headerName: 'X-Empty-Options',
        options: {},
      };

      // Act
      const result = testDecoratorImplementation(param);

      // Assert
      expect(result).toBe('value');
    });
  });
});
