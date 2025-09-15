import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;
  public pubSub: PubSub;

  constructor() {
    this.pubSub = new PubSub();
  }

  async onModuleInit() {
    try {
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });

      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this.redisClient.on('connect', () => {
        console.log('Connected to Redis');
      });

      await this.redisClient.connect();
    } catch (error) {
      console.warn('Redis connection failed, using in-memory PubSub:', error.message);
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  getClient(): RedisClientType {
    return this.redisClient;
  }

  getPubSub(): PubSub {
    return this.pubSub;
  }
}