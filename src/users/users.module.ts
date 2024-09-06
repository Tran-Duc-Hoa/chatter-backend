import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { S3Module } from 'src/common/s3/s3.module';
import { User, UserSchema } from './entities/user.entity';
import { UsersRepository } from './user.repository';
import { UsersController } from './users.controller';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]), S3Module],
  providers: [UsersResolver, UsersService, UsersRepository],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
