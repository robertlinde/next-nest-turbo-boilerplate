import {ExecutionContext} from '@nestjs/common';
import {ActiveUser} from '../types/active-user.type';
import {User} from './user.decorator';

// Mock the decorator factory function for comprehensive testing
function mockUserFactory(
    data: keyof ActiveUser | undefined,
    ctx: ExecutionContext,
): ActiveUser | string | undefined {
    const request = ctx.switchToHttp().getRequest<{user: ActiveUser}>();
    const {user} = request;

    return data ? user?.[data] : user;
}

describe('User Decorator', (): void => {
    describe('Decorator Structure', (): void => {
        it('should be defined', (): void => {
            expect(User).toBeDefined();
            expect(typeof User).toBe('function');
        });

        it('should return a function when called without parameters', (): void => {
            const result = User();
            expect(typeof result).toBe('function');
        });

        it('should return a function when called with property parameter', (): void => {
            const result = User('userId');
            expect(typeof result).toBe('function');
        });
    });

    describe('Decorator Functionality (Mock)', (): void => {
        let mockExecutionContext: ExecutionContext;
        let mockRequest: {user: ActiveUser};

        beforeEach((): void => {
            const mockUser: ActiveUser = {
                userId: 'test-user-id',
            };

            mockRequest = {
                user: mockUser,
            };

            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const mockExecutionContextLocal: ExecutionContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
            } as ExecutionContext;
            mockExecutionContext = mockExecutionContextLocal;
        });

        describe('User extraction', (): void => {
            it('should return full user object when no data parameter is provided', (): void => {
                const result = mockUserFactory(undefined, mockExecutionContext);
                expect(result).toEqual(mockRequest.user);
            });

            it('should return specific user property when data parameter is provided', (): void => {
                const result = mockUserFactory('userId', mockExecutionContext);
                expect(result).toBe('test-user-id');
            });

            it('should return undefined when user is not present', (): void => {
                (mockRequest as {user: ActiveUser | undefined}).user = undefined;
                const result = mockUserFactory(undefined, mockExecutionContext);
                expect(result).toBeUndefined();
            });

            it('should return undefined when accessing property of undefined user', (): void => {
                (mockRequest as {user: ActiveUser | undefined}).user = undefined;
                const result = mockUserFactory('userId', mockExecutionContext);
                expect(result).toBeUndefined();
            });
        });

        describe('Property access safety', (): void => {
            it('should handle null user safely', (): void => {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                (mockRequest as {user: ActiveUser | null}).user = null as any;
                const result = mockUserFactory('userId', mockExecutionContext);
                expect(result).toBeUndefined();
            });

            it('should handle user with undefined properties', (): void => {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                mockRequest.user = {} as ActiveUser;
                const result = mockUserFactory('userId', mockExecutionContext);
                expect(result).toBeUndefined();
            });
        });

        describe('Different user data scenarios', (): void => {
            it('should work with user object containing only userId', (): void => {
                const result = mockUserFactory(undefined, mockExecutionContext);
                expect(result).toHaveProperty('userId', 'test-user-id');
            });

            it('should return userId when specifically requested', (): void => {
                const result = mockUserFactory('userId', mockExecutionContext);
                expect(typeof result).toBe('string');
                expect(result).toBe('test-user-id');
            });
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

        it('should allow multiple uses of the decorator', (): void => {
            expect((): unknown => {
                class TestController {
                    testMethod1(@User() user: ActiveUser): ActiveUser {
                        return user;
                    }

                    testMethod2(@User('userId') userId: string): string {
                        return userId;
                    }
                }
                return TestController;
            }).not.toThrow();
        });
    });

    describe('Edge Cases', (): void => {
        let mockExecutionContext: ExecutionContext;

        beforeEach((): void => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const mockExecutionContextLocal: ExecutionContext = {
                switchToHttp: () => ({
                    getRequest: () => ({}),
                }),
            } as ExecutionContext;
            mockExecutionContext = mockExecutionContextLocal;
        });

        it('should handle request without user property', (): void => {
            const result = mockUserFactory(undefined, mockExecutionContext);
            expect(result).toBeUndefined();
        });

        it('should handle request without user property when accessing specific field', (): void => {
            const result = mockUserFactory('userId', mockExecutionContext);
            expect(result).toBeUndefined();
        });
    });
});