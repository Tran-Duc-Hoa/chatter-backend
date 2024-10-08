import { Inject, Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { Types } from 'mongoose';

import { PUB_SUB } from 'src/common/constants/injection-tokens';
import { UsersService } from 'src/users/users.service';
import { ChatsRepository } from '../chats.repository';
import { MESSAGE_CREATED } from './constants/pubsub.triggers';
import { CreateMessageInput } from './dto/create-message.input';
import { GetMessagesArgs } from './dto/get-messages.args';
import { MessageCreatedArgs } from './dto/message-created.args';
import { MessageDocument } from './entities/message.document';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly usersService: UsersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub
  ) {}

  async create({ content, chatId }: CreateMessageInput, userId: string) {
    const messageDocument: MessageDocument = {
      content: content.trim(),
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
      _id: new Types.ObjectId()
    };

    await this.chatsRepository.findOneAndUpdate(
      {
        _id: chatId
      },
      {
        $push: {
          messages: messageDocument
        }
      }
    );

    const message: Message = {
      ...messageDocument,
      chatId,
      user: await this.usersService.findOne(userId)
    };

    this.pubSub.publish(MESSAGE_CREATED, {
      messageCreated: message
    });
    return message;
  }

  async getMessages({ chatId, skip = 0, limit = 15 }: GetMessagesArgs) {
    const messages = await this.chatsRepository.model.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(chatId)
        }
      },
      {
        $unwind: '$messages'
      },
      {
        $replaceRoot: {
          newRoot: '$messages'
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $unset: 'userId' },
      { $set: { chatId } }
    ]);

    messages.forEach((message) => {
      message.user = this.usersService.toEntity(message.user);
    });

    return messages;
  }

  async messageCreated(_messageCreatedArgs: MessageCreatedArgs) {
    return this.pubSub.asyncIterator(MESSAGE_CREATED);
  }

  async countMessages(chatId: string) {
    return (
      await this.chatsRepository.model.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(chatId)
          }
        },
        { $unwind: '$messages' },
        { $count: 'messages' }
      ])
    )[0];
  }
}
