import {ValidateHeader} from './validate-header.decorator';

describe('ValidateHeader Decorator', () => {
  describe('Decorator Structure', () => {
    it('should be defined', () => {
      expect(ValidateHeader).toBeDefined();
      expect(typeof ValidateHeader).toBe('function');
    });

    it('should be a NestJS parameter decorator', () => {
      // Parameter decorators created with createParamDecorator have length 1
      expect(ValidateHeader.length).toBe(1);
    });

    it('should work as a decorator on class methods', () => {
      expect(() => {
        class TestController {
          testMethod(@ValidateHeader('authorization') auth: string) {
            return auth;
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work with object configuration', () => {
      expect(() => {
        class TestController {
          testMethod(
            @ValidateHeader({
              headerName: 'authorization',
              options: {expectedValue: 'Bearer'},
            })
            auth: string,
          ) {
            return auth;
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work with complex configuration', () => {
      expect(() => {
        class TestController {
          testMethod(
            @ValidateHeader({
              headerName: 'content-type',
              options: {
                expectedValue: ['application/json', 'application/xml'],
                caseSensitive: true,
                missingMessage: 'Content-Type header is required',
              },
            })
            contentType: string,
          ) {
            return contentType;
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work with RegExp validation', () => {
      expect(() => {
        class TestController {
          testMethod(
            @ValidateHeader({
              headerName: 'authorization',
              options: {
                expectedValue: /^Bearer\s+/,
              },
            })
            auth: string,
          ) {
            return auth;
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work with enum validation', () => {
      enum ContentType {
        JSON = 'application/json',
        XML = 'application/xml',
      }

      expect(() => {
        class TestController {
          testMethod(
            @ValidateHeader({
              headerName: 'content-type',
              options: {
                expectedValue: ContentType,
              },
            })
            contentType: string,
          ) {
            return contentType;
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work with allowEmpty option', () => {
      expect(() => {
        class TestController {
          testMethod(
            @ValidateHeader({
              headerName: 'optional-header',
              options: {
                allowEmpty: true,
              },
            })
            header: string,
          ) {
            return header;
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work with custom error messages', () => {
      expect(() => {
        class TestController {
          testMethod(
            @ValidateHeader({
              headerName: 'required-header',
              options: {
                missingMessage: 'This header is required',
                invalidValueMessage: 'Invalid header value',
              },
            })
            header: string,
          ) {
            return header;
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work with case-sensitive validation', () => {
      expect(() => {
        class TestController {
          testMethod(
            @ValidateHeader({
              headerName: 'content-type',
              options: {
                expectedValue: 'application/json',
                caseSensitive: true,
              },
            })
            contentType: string,
          ) {
            return contentType;
          }
        }
        return TestController;
      }).not.toThrow();
    });
  });
});
