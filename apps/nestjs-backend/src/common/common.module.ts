import {Global, Logger, MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {LoggerMiddleware} from './logger/logger.middleware';
import {LoggerModule} from './logger/logger.module';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [Logger],
  exports: [LoggerModule],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
