import {Controller, Get, type INestApplication} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {type Request, type Response, type NextFunction} from 'express';
import * as request from 'supertest';
import {ActiveUser} from '../types/active-user.type';
import {User} from './user.decorator';

// Extend Express Request to include user property for testing
type AuthenticatedRequest = Request & {
  user?: ActiveUser;
};

// Helper function to safely cast the HTTP server for supertest
function getServerForTest(app: INestApplication): Parameters<typeof request>[0] {
  return app.getHttpServer() as unknown as Parameters<typeof request>[0];
}

// Test controller to test the decorator in context
@Controller('test')
class TestController {
  @Get('user')
  getUserTest(@User() user: ActiveUser): {user: ActiveUser} {
    return {user};
  }

  @Get('user-id')
  getUserIdTest(@User('userId') userId: string): {userId: string} {
    return {userId};
  }

  @Get('user-partial')
  getUserPartialTest(@User('userId') userId: string, @User() fullUser: ActiveUser): {userId: string; fullUser: ActiveUser} {
    return {userId, fullUser};
  }
}

describe('User Decorator', () => {
  let app: INestApplication;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = testingModule.createNestApplication();

    // Mock authentication middleware that sets user in request
    app.use((req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      req.user = {
        userId: 'test-user-123',
      };
      next();
    });

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('User decorator functionality', () => {
    it('should extract full user object when no parameter specified', async () => {
      const response = await request(getServerForTest(app))
        .get('/test/user')
        .expect(200);

      expect(response.body).toEqual({
        user: {
          userId: 'test-user-123',
        },
      });
    });

    it('should extract specific user property when parameter specified', async () => {
      const response = await request(getServerForTest(app))
        .get('/test/user-id')
        .expect(200);

      expect(response.body).toEqual({
        userId: 'test-user-123',
      });
    });

    it('should work with multiple decorator instances', async () => {
      const response = await request(getServerForTest(app))
        .get('/test/user-partial')
        .expect(200);

      expect(response.body).toEqual({
        userId: 'test-user-123',
        fullUser: {
          userId: 'test-user-123',
        },
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle missing user in request', async () => {
      // Create a test without user middleware
      const noUserTestingModule = await Test.createTestingModule({
        controllers: [TestController],
      }).compile();

      const noUserApp = noUserTestingModule.createNestApplication();
      await noUserApp.init();

      const response = await request(getServerForTest(noUserApp))
        .get('/test/user')
        .expect(200);

      expect(response.body).toEqual({
        user: undefined,
      });

      await noUserApp.close();
    });

    it('should handle missing user property', async () => {
      // Create a test with partial user
      const partialUserTestingModule = await Test.createTestingModule({
        controllers: [TestController],
      }).compile();

      const partialUserApp = partialUserTestingModule.createNestApplication();

      // Mock middleware with incomplete user
      partialUserApp.use((req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        req.user = {} as ActiveUser; // Empty user object for testing missing properties
        next();
      });

      await partialUserApp.init();

      const response = await request(getServerForTest(partialUserApp))
        .get('/test/user-id')
        .expect(200);

      expect(response.body).toEqual({
        userId: undefined,
      });

      await partialUserApp.close();
    });
  });
});