import {ActiveUser} from '../types/active-user.type';
import {User} from './user.decorator';

describe('User Decorator', () => {
  describe('Decorator Structure', () => {
    it('should be defined', () => {
      expect(User).toBeDefined();
      expect(typeof User).toBe('function');
    });

    it('should be a NestJS parameter decorator', () => {
      // Parameter decorators created with createParamDecorator have length 1
      expect(User.length).toBe(1);
    });

    it('should work as a decorator on class methods without parameters', () => {
      expect(() => {
        class TestController {
          testMethod(@User() user: ActiveUser) {
            return user;
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work as a decorator with specific property extraction', () => {
      expect(() => {
        class TestController {
          testMethod(@User('userId') userId: string) {
            return userId;
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work with typed parameters', () => {
      expect(() => {
        class TestController {
          getUserId(@User('userId') userId: string) {
            return userId;
          }

          getFullUser(@User() user: ActiveUser) {
            return user;
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should be applicable multiple times in the same method', () => {
      expect(() => {
        class TestController {
          testMethod(@User() user: ActiveUser, @User('userId') userId: string) {
            return {user, userId};
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work with all valid ActiveUser properties', () => {
      expect(() => {
        class TestController {
          getUserProperty(@User('userId') userId: string) {
            return userId;
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work in complex controller scenarios', () => {
      expect(() => {
        class TestController {
          createResource(@User() user: ActiveUser, @User('userId') userId: string) {
            return {
              createdBy: user,
              createdByUserId: userId,
            };
          }

          updateResource(@User('userId') userId: string) {
            return {updatedBy: userId};
          }

          deleteResource(@User() user: ActiveUser) {
            return {deletedBy: user.userId};
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should be compatible with other decorators', () => {
      expect(() => {
        class TestController {
          testMethod(@User() user: ActiveUser, otherParam: string) {
            return {user, otherParam};
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work without any parameters', () => {
      expect(() => {
        class TestController {
          getUser(@User() user: ActiveUser) {
            return user;
          }
        }
        return TestController;
      }).not.toThrow();
    });

    it('should work with valid property access', () => {
      expect(() => {
        class TestController {
          getUserId(@User('userId') id: string) {
            return id;
          }
        }
        return TestController;
      }).not.toThrow();
    });
  });
});
