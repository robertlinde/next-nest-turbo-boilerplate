import {MikroOrmModule} from '@mikro-orm/nestjs';
import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {APP_GUARD} from '@nestjs/core';
import {ScheduleModule} from '@nestjs/schedule';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import mikroOrmConfig from 'mikro-orm.config';
import {CommonModule} from './common/common.module';
import appConfig from './config/app.config';
import validationSchema from './config/validation.schema';
import {EmailModule} from './email/email.module';
import {HealthModule} from './health/health.module';
import {RedisModule} from './common/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema,
      load: [appConfig],
    }),
    ScheduleModule.forRoot(),
    MikroOrmModule.forRoot(mikroOrmConfig),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default-throttler',
          ttl: 60 * 1000,
          limit: 60,
        },
      ],
    }),
    CommonModule,
    EmailModule,
    HealthModule,
    RedisModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
