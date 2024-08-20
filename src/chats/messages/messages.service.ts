import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ChatsRepository } from '../chats.repository';
import { CreateMessageInput } from './dto/create-message.input';
import { GetMessagesArgs } from './dto/get-messages.args';
import { UpdateMessageInput } from './dto/update-message.input';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(private readonly chatsRepository: ChatsRepository) {}

  private userChatFilter(userId: string) {
    return {
      $or: [{ userId }, { userIds: { $in: [userId] } }]
    };
  }

  async create({ content, chatId }: CreateMessageInput, userId: string) {
    const message: Message = {
      content: content.trim(),
      userId,
      createdAt: new Date(),
      _id: new Types.ObjectId()
    };

    await this.chatsRepository.findOneAndUpdate(
      {
        _id: chatId,
        ...this.userChatFilter(userId)
      },
      {
        $push: {
          messages: message
        }
      }
    );

    return message;
  }

  async getMessages({ chatId }: GetMessagesArgs, userId: string) {
    return (await this.chatsRepository.findOne({ _id: chatId, ...this.userChatFilter(userId) })).messages;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageInput: UpdateMessageInput) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
