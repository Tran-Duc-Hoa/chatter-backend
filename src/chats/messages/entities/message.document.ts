import { Field } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractEntity } from 'src/common/database/abstract.entity';

@Schema()
export class MessageDocument extends AbstractEntity {
  @Field()
  @Prop()
  content: string;

  @Field()
  @Prop()
  userId: Types.ObjectId;

  @Field()
  @Prop()
  createdAt: Date;
}
