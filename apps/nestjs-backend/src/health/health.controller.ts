import {Controller, Get} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiResponse} from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  MikroOrmHealthIndicator,
  HealthIndicatorResult,
  HealthCheckResult,
} from '@nestjs/terminus';
import {Public} from '../auth/decorators/public.decorator';

@Public()
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: MikroOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({summary: 'Check application health status'})
  @ApiResponse({
    status: 200,
    description: 'Health check successful',
  })
  @ApiResponse({
    status: 503,
    description: 'Service Unavailable',
  })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([async (): Promise<HealthIndicatorResult> => this.db.pingCheck('database')]);
  }
}
