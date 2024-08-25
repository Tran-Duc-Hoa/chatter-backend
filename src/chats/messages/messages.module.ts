import { forwardRef, Module } from '@nestjs/common';
import { PubSubModule } from 'src/common/pubsub.module';
import { ChatsModule } from '../chats.module';
import { MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';

@Module({
  imports: [forwardRef(() => ChatsModule), PubSubModule],
  providers: [MessagesResolver, MessagesService]
})
export class MessagesModule {}
