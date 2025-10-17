import {Injectable, OnModuleInit, OnModuleDestroy, InternalServerErrorException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import Redis, {RedisOptions} from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private publisher: Redis | undefined;
  private subscriber: Redis | undefined;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const redisConfig: RedisOptions = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    };

    this.publisher = new Redis(redisConfig);
    this.subscriber = new Redis(redisConfig);
  }

  async publish<T>(channel: string, message: T): Promise<void> {
    const serialized = JSON.stringify(message);
    if (!this.publisher) {
      throw new InternalServerErrorException('Redis publisher is not initialized');
    }

    await this.publisher.publish(channel, serialized);
  }

  async subscribe<T>(channel: string, callback: (message: T) => void): Promise<void> {
    if (!this.subscriber) {
      throw new InternalServerErrorException('Redis subscriber is not initialized');
    }

    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        try {
          const parsed = JSON.parse(msg) as T;
          callback(parsed);
        } catch (error) {
          console.error('Failed to parse message:', error);
          callback(msg as T);
        }
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    if (!this.subscriber) {
      throw new InternalServerErrorException('Redis subscriber is not initialized');
    }

    await this.subscriber.unsubscribe(channel);
  }

  async onModuleDestroy(): Promise<void> {
    await this.publisher?.quit();
    await this.subscriber?.quit();
  }
}
