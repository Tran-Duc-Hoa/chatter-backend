import { forwardRef, Module } from '@nestjs/common';
import { PubSubModule } from 'src/common/pubsub/pubsub.module';
import { UsersModule } from 'src/users/users.module';
import { ChatsModule } from '../chats.module';
import { MessagesController } from './messages.controller';
import { MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';

@Module({
  imports: [forwardRef(() => ChatsModule), PubSubModule, UsersModule],
  providers: [MessagesResolver, MessagesService],
  controllers: [MessagesController]
})
export class MessagesModule {}
