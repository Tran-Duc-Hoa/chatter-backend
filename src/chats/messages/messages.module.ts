import { forwardRef, Module } from '@nestjs/common';
import { ChatsModule } from '../chats.module';
import { MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';

@Module({
  imports: [forwardRef(() => ChatsModule)],
  providers: [MessagesResolver, MessagesService]
})
export class MessagesModule {}
