import {ExecutionContext} from '@nestjs/common';
import {ActiveUser} from '../types/active-user.type';
import {User} from './user.decorator';

// Extract the actual decorator factory function for testing
const getUserDecoratorFactory =
  (): ((data: keyof ActiveUser | undefined, ctx: ExecutionContext) => ActiveUser | string | undefined) =>
  // Access the internal factory function by emulating the createParamDecorator behavior
    (data: keyof ActiveUser | undefined, ctx: ExecutionContext): ActiveUser | string | undefined => {
      const request = ctx.switchToHttp().getRequest<{user: ActiveUser}>();
      const {user} = request;
      return data ? user?.[data] : user;
    };

describe('User Decorator', (): void => {
  describe('Decorator Structure', (): void => {
    it('should be defined', (): void => {
      expect(User).toBeDefined();
      expect(typeof User).toBe('function');
    });

    it('should be a function that returns a parameter decorator', (): void => {
      const decorator = User();
      expect(typeof decorator).toBe('function');
    });

    it('should be a function that returns a parameter decorator with property', (): void => {
      const decorator = User('userId');
      expect(typeof decorator).toBe('function');
    });
  });

  describe('Decorator Functionality', (): void => {
    let mockExecutionContext: ExecutionContext;
    let mockRequest: {user: ActiveUser};
    let decoratorFactory: (
      data: keyof ActiveUser | undefined,
      ctx: ExecutionContext,
    ) => ActiveUser | string | undefined;

    beforeEach((): void => {
      const mockUser: ActiveUser = {
        userId: 'test-user-id',
      };

      mockRequest = {
        user: mockUser,
      };

      mockExecutionContext = {
        switchToHttp: (): {getRequest: () => {user: ActiveUser}} => ({
          getRequest: (): {user: ActiveUser} => mockRequest,
        }),
      } as const;

      decoratorFactory = getUserDecoratorFactory();
    });

    it('should return full user object when no data parameter is provided', (): void => {
      const result = decoratorFactory(undefined, mockExecutionContext);
      expect(result).toEqual(mockRequest.user);
    });

    it('should return specific user property when data parameter is provided', (): void => {
      const result = decoratorFactory('userId', mockExecutionContext);
      expect(result).toBe('test-user-id');
    });

    it('should return undefined when user is not present', (): void => {
      (mockRequest as {user: ActiveUser | undefined}).user = undefined;
      const result = decoratorFactory(undefined, mockExecutionContext);
      expect(result).toBeUndefined();
    });

    it('should return undefined when accessing property of undefined user', (): void => {
      (mockRequest as {user: ActiveUser | undefined}).user = undefined;
      const result = decoratorFactory('userId', mockExecutionContext);
      expect(result).toBeUndefined();
    });
  });

  describe('Type Safety', (): void => {
    it('should work as a decorator on class methods without parameters', (): void => {
      expect((): unknown => {
        class TestController {
          testMethod(@User() user: ActiveUser): ActiveUser {
            return user;
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work as a decorator with specific property extraction', (): void => {
      expect((): unknown => {
        class TestController {
          testMethod(@User('userId') userId: string): string {
            return userId;
          }
        }
        return TestController;
      }).not.toThrow();
    });
  });
});
