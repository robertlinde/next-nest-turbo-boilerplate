import {HealthCheckService, MikroOrmHealthIndicator, HealthIndicatorResult, HealthCheckResult} from '@nestjs/terminus';
import {Test, TestingModule} from '@nestjs/testing';
import {mockDeep, DeepMockProxy} from 'jest-mock-extended';
import {HealthController} from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: DeepMockProxy<HealthCheckService>;
  let mikroOrmHealthIndicator: DeepMockProxy<MikroOrmHealthIndicator>;

  const mockHealthIndicatorResult: HealthIndicatorResult = {
    database: {
      status: 'up',
    },
  };

  const mockHealthCheckResult: HealthCheckResult = {
    status: 'ok',
    info: {
      database: {
        status: 'up',
      },
    },
    error: {},
    details: {
      database: {
        status: 'up',
      },
    },
  };

  beforeEach(async () => {
    healthCheckService = mockDeep<HealthCheckService>();
    mikroOrmHealthIndicator = mockDeep<MikroOrmHealthIndicator>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: healthCheckService,
        },
        {
          provide: MikroOrmHealthIndicator,
          useValue: mikroOrmHealthIndicator,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return healthy status when database is up', async () => {
      mikroOrmHealthIndicator.pingCheck.mockResolvedValue(mockHealthIndicatorResult);
      healthCheckService.check.mockResolvedValue(mockHealthCheckResult);

      const result = await controller.check();

      expect(healthCheckService.check).toHaveBeenCalledWith([expect.any(Function)]);
      expect(result).toEqual(mockHealthCheckResult);
      expect(result.status).toBe('ok');
      expect(result.details.database.status).toBe('up');
    });

    it('should call database ping check with correct parameters', async () => {
      mikroOrmHealthIndicator.pingCheck.mockResolvedValue(mockHealthIndicatorResult);
      healthCheckService.check.mockImplementation(async (checks) => {
        // Execute the health check function that was passed
        await checks[0]();
        return mockHealthCheckResult;
      });

      await controller.check();

      expect(mikroOrmHealthIndicator.pingCheck).toHaveBeenCalledWith('database');
    });

    it('should return unhealthy status when database is down', async () => {
      const unhealthyResult: HealthIndicatorResult = {
        database: {
          status: 'down',
          message: 'Database connection failed',
        },
      };

      const unhealthyCheckResult: HealthCheckResult = {
        status: 'error',
        info: {},
        error: {
          database: {
            status: 'down',
            message: 'Database connection failed',
          },
        },
        details: {
          database: {
            status: 'down',
            message: 'Database connection failed',
          },
        },
      };

      mikroOrmHealthIndicator.pingCheck.mockResolvedValue(unhealthyResult);
      healthCheckService.check.mockResolvedValue(unhealthyCheckResult);

      const result = await controller.check();

      expect(result.status).toBe('error');
      expect(result.error?.database.status).toBe('down');
      expect(result.error?.database.message).toBe('Database connection failed');
    });

    it('should handle database ping check errors', async () => {
      const error = new Error('Database connection timeout');
      mikroOrmHealthIndicator.pingCheck.mockRejectedValue(error);

      const errorCheckResult: HealthCheckResult = {
        status: 'error',
        info: {},
        error: {
          database: {
            status: 'down',
            message: 'Database connection timeout',
          },
        },
        details: {
          database: {
            status: 'down',
            message: 'Database connection timeout',
          },
        },
      };

      healthCheckService.check.mockImplementation(async (checks) => {
        try {
          await checks[0]();
        } catch {
          // Health check service would handle the error internally
        }

        return errorCheckResult;
      });

      const result = await controller.check();

      expect(result.status).toBe('error');
      expect(result.error?.database.status).toBe('down');
    });

    it('should handle multiple health check indicators if extended', async () => {
      // This test demonstrates extensibility for future health checks
      const multipleHealthResult: HealthCheckResult = {
        status: 'ok',
        info: {
          database: {
            status: 'up',
          },
          redis: {
            status: 'up',
          },
        },
        error: {},
        details: {
          database: {
            status: 'up',
          },
          redis: {
            status: 'up',
          },
        },
      };

      healthCheckService.check.mockResolvedValue(multipleHealthResult);

      const result = await controller.check();

      expect(result.status).toBe('ok');
      expect(Object.keys(result.details)).toContain('database');
    });
  });
});
