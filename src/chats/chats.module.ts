import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { ChatsController } from './chats.controller';
import { ChatsRepository } from './chats.repository';
import { ChatsResolver } from './chats.resolver';
import { ChatsService } from './chats.service';
import { ChatSchema } from './entities/chat.document';
import { Chat } from './entities/chat.entity';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [DatabaseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]), forwardRef(() => MessagesModule), UsersModule],
  providers: [ChatsResolver, ChatsService, ChatsRepository],
  exports: [ChatsRepository],
  controllers: [ChatsController]
})
export class ChatsModule {}
