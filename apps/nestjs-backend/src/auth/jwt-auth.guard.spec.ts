import {ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {Test, TestingModule} from '@nestjs/testing';
import {mock, MockProxy} from 'jest-mock-extended';
import {Observable, of} from 'rxjs';
import {IS_PUBLIC_KEY} from './decorators/public.decorator';
import {JwtAuthGuard} from './jwt-auth.guard';

// Properly mock the AuthGuard
jest.mock('@nestjs/passport', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  AuthGuard: jest.fn(
    () =>
      class MockAuthGuard {
        canActivate(): boolean | Promise<boolean> | Observable<boolean> {
          return true;
        }
      },
  ),
}));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: MockProxy<Reflector>;
  let mockContext: MockProxy<ExecutionContext>;
  let mockHandler: jest.Mock;
  let mockClass: jest.Mock;

  beforeEach(async () => {
    reflector = mock<Reflector>();

    // Set up mock handler and class functions
    mockHandler = jest.fn();
    mockClass = jest.fn();

    // Create mock execution context with properly implemented methods
    mockContext = mock<ExecutionContext>({
      getHandler: () => mockHandler,
      getClass: () => mockClass,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard, {provide: Reflector, useValue: reflector}],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  describe('canActivate', () => {
    it('should return true if route is marked as public', () => {
      // Setup
      reflector.getAllAndOverride.mockReturnValue(true);

      // Execute
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [mockHandler, mockClass]);
    });

    it('should delegate to parent canActivate if route is not public', () => {
      // Setup
      reflector.getAllAndOverride.mockReturnValue(false);

      // Create a spy on the parent's canActivate method
      const superCanActivate = jest.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate');
      superCanActivate.mockReturnValue(true);

      // Execute
      const result = guard.canActivate(mockContext);

      // Assert
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [mockHandler, mockClass]);
      expect(superCanActivate).toHaveBeenCalledWith(mockContext);
      expect(result).toBe(true);

      // Clean up
      superCanActivate.mockRestore();
    });

    it('should delegate to parent canActivate if route is not decorated', () => {
      // Setup
      reflector.getAllAndOverride.mockReturnValue(undefined);

      // Create a spy on the parent's canActivate method
      const superCanActivate = jest.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate');
      superCanActivate.mockReturnValue(true);

      // Execute
      const result = guard.canActivate(mockContext);

      // Assert
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [mockHandler, mockClass]);
      expect(superCanActivate).toHaveBeenCalledWith(mockContext);
      expect(result).toBe(true);

      // Clean up
      superCanActivate.mockRestore();
    });

    it('should handle Promise return type from parent canActivate', async () => {
      // Setup
      reflector.getAllAndOverride.mockReturnValue(false);

      // Create a spy on the parent's canActivate method
      const superCanActivate = jest.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate');
      superCanActivate.mockResolvedValue(true);

      // Execute
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [mockHandler, mockClass]);
      expect(superCanActivate).toHaveBeenCalledWith(mockContext);

      // Clean up
      superCanActivate.mockRestore();
    });

    it('should handle Observable return type from parent canActivate', (done) => {
      // Setup
      reflector.getAllAndOverride.mockReturnValue(false);

      // Create a spy on the parent's canActivate method
      const superCanActivate = jest.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate');
      superCanActivate.mockReturnValue(of(true));

      // Execute
      const result = guard.canActivate(mockContext) as Observable<boolean>;

      // Assert
      result.subscribe((value) => {
        expect(value).toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [mockHandler, mockClass]);
        expect(superCanActivate).toHaveBeenCalledWith(mockContext);

        // Clean up
        superCanActivate.mockRestore();
        done();
      });
    });
  });
});
