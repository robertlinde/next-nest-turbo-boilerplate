import {Reflector} from '@nestjs/core';
import {Public, IS_PUBLIC_KEY} from './public.decorator';

describe('Public Decorator', (): void => {
  let reflector: Reflector;

  beforeEach((): void => {
    reflector = new Reflector();
  });

  describe('metadata setting', (): void => {
    it('should set isPublic metadata to true', (): void => {
      @Public()
      class TestController {}

      const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, TestController);

      expect(isPublic).toBe(true);
    });

    it('should set isPublic metadata on method handlers', (): void => {
      class TestController {
        @Public()
        publicMethod(): string {
          return 'public';
        }

        privateMethod(): string {
          return 'private';
        }
      }

      const isPublicMethod = reflector.get<boolean>(IS_PUBLIC_KEY, TestController.prototype.publicMethod);
      const isPrivateMethod = reflector.get<boolean>(IS_PUBLIC_KEY, TestController.prototype.privateMethod);

      expect(isPublicMethod).toBe(true);
      expect(isPrivateMethod).toBeUndefined();
    });

    it('should return a CustomDecorator', (): void => {
      const decorator = Public();

      expect(typeof decorator).toBe('function');
      expect(decorator.name).toBe('decoratorFactory');
    });

    it('should work with multiple decorators', (): void => {
      class TestController {
        @Public()
        method1(): string {
          return 'method1';
        }

        @Public()
        method2(): string {
          return 'method2';
        }
      }

      const isPublicMethod1 = reflector.get<boolean>(IS_PUBLIC_KEY, TestController.prototype.method1);
      const isPublicMethod2 = reflector.get<boolean>(IS_PUBLIC_KEY, TestController.prototype.method2);

      expect(isPublicMethod1).toBe(true);
      expect(isPublicMethod2).toBe(true);
    });
  });

  describe('IS_PUBLIC_KEY constant', (): void => {
    it('should export the correct metadata key', (): void => {
      expect(IS_PUBLIC_KEY).toBe('isPublic');
    });

    it('should be used consistently', (): void => {
      @Public()
      class TestClass {}

      const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, TestClass);

      expect(isPublic).toBe(true);
    });
  });
});
