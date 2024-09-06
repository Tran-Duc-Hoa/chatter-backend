import { Injectable, NotFoundException } from '@nestjs/common';
import { PipelineStage, Types } from 'mongoose';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { ChatsRepository } from './chats.repository';
import { CreateChatInput } from './dto/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';

@Injectable()
export class ChatsService {
  constructor(private readonly chatsRepository: ChatsRepository) {}

  async create(createChatInput: CreateChatInput, userId: string) {
    return this.chatsRepository.create({ ...createChatInput, userId, messages: [] });
  }

  async findMany(prePipelineStages: PipelineStage[] = [], paginationArgs?: PaginationArgs) {
    const chats = await this.chatsRepository.model.aggregate([
      ...prePipelineStages,
      {
        $set: {
          latestMessage: {
            $cond: ['$messages', { $arrayElemAt: ['$messages', -1] }, { createdAt: new Date() }]
          }
        }
      },
      { $sort: { 'latestMessage.createdAt': -1 } },
      { $unset: 'messages' },
      { $skip: paginationArgs?.skip || 0 },
      { $limit: paginationArgs?.limit || 15 },
      {
        $lookup: {
          from: 'users',
          localField: 'latestMessage.userId',
          foreignField: '_id',
          as: 'latestMessage.user'
        }
      }
    ]);
    chats.forEach((chat) => {
      if (!chat.latestMessage?._id) {
        delete chat.latestMessage;
        return;
      }

      chat.latestMessage.user = chat.latestMessage.user?.[0];
      delete chat.latestMessage.userId;
      chat.latestMessage.chatId = chat._id;
    });

    return chats;
  }

  async findOne(_id: string) {
    const chats = this.findMany([
      {
        $match: { _id: new Types.ObjectId(_id) }
      }
    ]);

    if (!chats[0]) throw new NotFoundException(`No chat found with id ${_id}`);

    return chats[0];
  }

  update(id: number, updateChatInput: UpdateChatInput) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }

  async countChats() {
    return this.chatsRepository.model.countDocuments({});
  }
}
