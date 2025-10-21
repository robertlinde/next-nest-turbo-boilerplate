import {Global, Module} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {RedisService} from './redis.service';

@Global()
@Module({
  providers: [RedisService, ConfigService],
  exports: [RedisService],
})
export class RedisModule {}
