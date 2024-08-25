import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { AbstractEntity } from 'src/common/database/abstract.entity';

@ObjectType()
export class Message extends AbstractEntity {
  @Field()
  @Prop()
  content: string;

  @Field()
  @Prop()
  userId: string;

  @Field()
  @Prop()
  createdAt: Date;

  @Field()
  @Prop()
  chatId: string;
}
