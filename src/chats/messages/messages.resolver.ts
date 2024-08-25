import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { CurrentUser } from 'src/auth/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { PUB_SUB } from 'src/common/constants/injection-tokens';
import { CreateMessageInput } from './dto/create-message.input';
import { GetMessagesArgs } from './dto/get-messages.args';
import { MessageCreatedArgs } from './dto/message-created.args';
import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';

@Resolver(() => Message)
export class MessagesResolver {
  constructor(
    private readonly messagesService: MessagesService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub
  ) {}

  @Mutation(() => Message)
  @UseGuards(GqlAuthGuard)
  createMessage(@Args('createMessageInput') createMessageInput: CreateMessageInput, @CurrentUser() user: TokenPayload) {
    return this.messagesService.create(createMessageInput, user._id);
  }

  @Query(() => [Message], { name: 'messages' })
  @UseGuards(GqlAuthGuard)
  getMessages(@Args() getMessagesArgs: GetMessagesArgs, @CurrentUser() user: TokenPayload) {
    return this.messagesService.getMessages(getMessagesArgs, user._id);
  }

  @Subscription(() => Message, {
    filter: (payload, variables, context) => {
      const userId = context.req.user._id;
      return payload.messageCreated.chatId === variables.chatId && userId !== payload.messageCreated.userId;
    }
  })
  messageCreated(@Args() messageCreatedArgs: MessageCreatedArgs, @CurrentUser() user: TokenPayload) {
    return this.messagesService.messageCreated(messageCreatedArgs, user._id);
  }
}
