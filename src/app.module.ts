import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Logger, Module, UnauthorizedException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { ChatsModule } from './chats/chats.module';
import { DatabaseModule } from './common/database/database.module';
import { PubSubModule } from './common/pubsub.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required()
      })
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (authService: AuthService) => ({
        autoSchemaFile: true,
        cors: true,
        subscriptions: {
          'graphql-ws': {
            onConnect: (context: any) => {
              try {
                const request = context.extra.request;
                const user = authService.verifyWs(request);
                context.user = user;
              } catch (error) {
                new Logger().error(error);
                throw new UnauthorizedException();
              }
            }
          }
        }
      }),
      imports: [AuthModule],
      inject: [AuthService]
    }),
    DatabaseModule,
    UsersModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true
                  }
                },
            level: isProduction ? 'info' : 'debug'
          }
        };
      }
    }),
    AuthModule,
    PubSubModule,
    ChatsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
