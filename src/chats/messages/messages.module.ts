import { forwardRef, Module } from '@nestjs/common';
import { PubSubModule } from 'src/common/pubsub.module';
import { UsersModule } from 'src/users/users.module';
import { ChatsModule } from '../chats.module';
import { MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';

@Module({
  imports: [forwardRef(() => ChatsModule), PubSubModule, UsersModule],
  providers: [MessagesResolver, MessagesService],
  controllers: [MessagesController]
})
export class MessagesModule {}
