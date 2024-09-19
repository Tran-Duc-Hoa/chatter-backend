import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PubSub } from 'graphql-subscriptions';
import { Redis } from 'ioredis';
import { PUB_SUB } from '../constants/injection-tokens';
import { reviver } from './reviver';

@Module({
  providers: [
    {
      provide: PUB_SUB,
      useFactory: (configService: ConfigService) => {
        if (configService.get('NODE_ENV') === 'production') {
          const options = {
            host: configService.getOrThrow('REDIS_HOST'),
            port: configService.getOrThrow('REDIS_PORT')
          };

          return new RedisPubSub({
            publisher: new Redis(options),
            subscriber: new Redis(options),
            reviver
          });
        }

        return new PubSub();
      },
      inject: [ConfigService]
    }
  ],
  exports: [PUB_SUB]
})
export class PubSubModule {}
