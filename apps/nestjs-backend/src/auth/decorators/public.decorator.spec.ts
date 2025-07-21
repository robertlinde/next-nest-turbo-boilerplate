import {Reflector} from '@nestjs/core';
import {Public, IS_PUBLIC_KEY} from './public.decorator';

describe('Public Decorator', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  describe('Public decorator', () => {
    it('should set isPublic metadata to true', () => {
      // Test class using the decorator
      @Public()
      class TestClass {
        testMethod(): string {
          return 'test';
        }
      }

      const metadata = reflector.get<boolean>(IS_PUBLIC_KEY, TestClass);
      expect(metadata).toBe(true);
    });

    it('should work on methods', () => {
      class TestClass {
        @Public()
        testMethod(): string {
          return 'test';
        }

        normalMethod(): string {
          return 'normal';
        }
      }

      const publicMetadata = reflector.get<boolean>(IS_PUBLIC_KEY, TestClass.prototype.testMethod);
      const normalMetadata = reflector.get<boolean>(IS_PUBLIC_KEY, TestClass.prototype.normalMethod);

      expect(publicMetadata).toBe(true);
      expect(normalMetadata).toBeUndefined();
    });

    it('should export IS_PUBLIC_KEY constant', () => {
      expect(IS_PUBLIC_KEY).toBe('isPublic');
    });

    it('should return a custom decorator function', () => {
      const decorator = Public();
      expect(typeof decorator).toBe('function');
    });
  });
});
