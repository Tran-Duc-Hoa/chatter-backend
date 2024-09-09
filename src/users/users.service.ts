import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';

import { S3Service } from 'src/common/s3/s3.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserDocument } from './entities/user.document';
import { User } from './entities/user.entity';
import { UsersRepository } from './user.repository';
import { USERS_BUCKET, USERS_IMAGE_FILE_EXTENSION } from './users.constant';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly s3Service: S3Service
  ) {}

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async create(createUserInput: CreateUserInput) {
    try {
      const user = this.toEntity(
        await this.usersRepository.create({
          ...createUserInput,
          password: await this.hashPassword(createUserInput.password)
        })
      );
      return user;
    } catch (error) {
      if (error.message.includes('duplicate key error')) {
        throw new BadRequestException('User already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return (await this.usersRepository.find({})).map((userDocument) => this.toEntity(userDocument));
  }

  async findOne(_id: string) {
    return this.toEntity(await this.usersRepository.findOne({ _id }));
  }

  async update(_id: Types.ObjectId, updateUserInput: UpdateUserInput) {
    if (updateUserInput.password) {
      updateUserInput.password = await this.hashPassword(updateUserInput.password);
    }

    return this.toEntity(
      await this.usersRepository.findOneAndUpdate(
        { _id },
        {
          $set: {
            ...updateUserInput
          }
        }
      )
    );
  }

  async remove(_id: Types.ObjectId) {
    return this.toEntity(await this.usersRepository.findOneAndDelete({ _id }));
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credentials are invalid');
    }

    return this.toEntity(user);
  }

  async uploadImage(file: Buffer, userId: string) {
    await this.s3Service.upload({ bucket: USERS_BUCKET, key: this.getUserImage(userId), file });
  }

  toEntity(userDocument: UserDocument): User {
    const user = {
      ...userDocument,
      imageUrl: this.s3Service.getObjectUrl(USERS_BUCKET, this.getUserImage(userDocument._id.toHexString()))
    };
    delete user.password;

    return user;
  }

  private getUserImage(userId: string) {
    return `${userId}.${USERS_IMAGE_FILE_EXTENSION}`;
  }
}
