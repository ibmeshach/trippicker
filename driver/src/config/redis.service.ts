import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType, createClient } from 'redis';

@Injectable()
export class RedisConfigService {
  private static redisClient: RedisClientType;

  constructor(private configService: ConfigService) {
    if (!RedisConfigService.redisClient) {
      const redisUrl = this.configService.get<string>('REDIS_URL');

      RedisConfigService.redisClient = createClient({
        url: redisUrl,
      });

      RedisConfigService.redisClient.on('ready', () => {
        console.log('Redis connection established and ready to use!');
      });

      RedisConfigService.redisClient.on('error', (err) => {
        console.error('Redis Client Error', err);
      });

      RedisConfigService.redisClient.connect();
    }
  }

  getClient(): RedisClientType {
    return RedisConfigService.redisClient;
  }
  // Example method to set a value in Redis
  async set(key: string, value: any, expireInSeconds?: number): Promise<void> {
    if (expireInSeconds) {
      await RedisConfigService.redisClient.set(key, value, {
        EX: expireInSeconds,
      });
    } else {
      await RedisConfigService.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await RedisConfigService.redisClient.get(key);
  }
}
