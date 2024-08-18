import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType, createClient } from 'redis';

@Injectable()
export class RedisConfigService {
  private readonly redisClient: RedisClientType;

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    this.redisClient = createClient({
      url: redisUrl,
    });

    this.redisClient.on('ready', () => {
      console.log('Redis connection established and ready to use!');
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    this.redisClient.connect();
  }

  getClient(): RedisClientType {
    return this.redisClient;
  }

  // Example method to set a value in Redis
  async set(key: string, value: any, expireInSeconds?: number): Promise<void> {
    if (expireInSeconds) {
      await this.redisClient.set(key, value, {
        EX: expireInSeconds,
      });
    } else {
      await this.redisClient.set(key, value);
    }
  }

  // Example method to get a value from Redis
  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }
}
