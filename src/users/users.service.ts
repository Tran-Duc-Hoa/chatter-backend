import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';

import { S3Service } from 'src/common/s3/s3.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
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
      const user = await this.usersRepository.create({
        ...createUserInput,
        password: await this.hashPassword(createUserInput.password)
      });
      return user;
    } catch (error) {
      if (error.message.includes('duplicate key error')) {
        throw new BadRequestException('User already exists');
      }
      throw error;
    }
  }

  findAll() {
    return this.usersRepository.find({});
  }

  findOne(_id: string) {
    return this.usersRepository.findOne({ _id });
  }

  async update(_id: Types.ObjectId, updateUserInput: UpdateUserInput) {
    if (updateUserInput.password) {
      updateUserInput.password = await this.hashPassword(updateUserInput.password);
    }

    return this.usersRepository.findOneAndUpdate(
      { _id },
      {
        $set: {
          ...updateUserInput
        }
      }
    );
  }

  remove(_id: Types.ObjectId) {
    return this.usersRepository.findOneAndDelete({ _id });
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credentials are invalid');
    }

    return user;
  }

  async uploadImage(file: Buffer, userId: string) {
    await this.s3Service.upload({ bucket: USERS_BUCKET, key: `${userId}.${USERS_IMAGE_FILE_EXTENSION}`, file });
  }
}
