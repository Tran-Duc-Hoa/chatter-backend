import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ChatsRepository } from './chats.prepository';
import { ChatsResolver } from './chats.resolver';
import { ChatsService } from './chats.service';
import { Chat, ChatSchema } from './entities/chat.entity';

@Module({
  imports: [DatabaseModule.forFeature([{ name: Chat.name, schema: ChatSchema }])],
  providers: [ChatsResolver, ChatsService, ChatsRepository]
})
export class ChatsModule {}
