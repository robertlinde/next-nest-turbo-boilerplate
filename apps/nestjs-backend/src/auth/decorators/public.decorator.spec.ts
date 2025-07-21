import {Reflector} from '@nestjs/core';
import {Public, IS_PUBLIC_KEY} from './public.decorator';

describe('Public Decorator', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  describe('metadata setting', () => {
    it('should set isPublic metadata to true', () => {
      @Public()
      class TestController {}

      const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, TestController);

      expect(isPublic).toBe(true);
    });

    it('should set isPublic metadata on method handlers', () => {
      class TestController {
        @Public()
        publicMethod() {
          return 'public';
        }

        privateMethod() {
          return 'private';
        }
      }

      const isPublicMethod = reflector.get<boolean>(IS_PUBLIC_KEY, TestController.prototype.publicMethod);
      const isPrivateMethod = reflector.get<boolean>(IS_PUBLIC_KEY, TestController.prototype.privateMethod);

      expect(isPublicMethod).toBe(true);
      expect(isPrivateMethod).toBeUndefined();
    });

    it('should return a CustomDecorator', () => {
      const decorator = Public();

      expect(typeof decorator).toBe('function');
      expect(decorator.name).toBe('decoratorFactory');
    });

    it('should work with multiple decorators', () => {
      class TestController {
        @Public()
        method1() {
          return 'method1';
        }

        @Public()
        method2() {
          return 'method2';
        }
      }

      const isPublicMethod1 = reflector.get<boolean>(IS_PUBLIC_KEY, TestController.prototype.method1);
      const isPublicMethod2 = reflector.get<boolean>(IS_PUBLIC_KEY, TestController.prototype.method2);

      expect(isPublicMethod1).toBe(true);
      expect(isPublicMethod2).toBe(true);
    });
  });

  describe('IS_PUBLIC_KEY constant', () => {
    it('should export the correct metadata key', () => {
      expect(IS_PUBLIC_KEY).toBe('isPublic');
    });

    it('should be used consistently', () => {
      @Public()
      class TestClass {}

      const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, TestClass) as boolean;

      expect(metadata).toBe(true);
    });
  });
});
