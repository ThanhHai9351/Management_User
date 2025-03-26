import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { hashPassword } from '@/helpers/bcrypt-password';
import { GlobalResponse, GlobalResponseData } from '@/global/globalResponse';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import aqp from 'api-query-params';
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async isEmailExists(email: string) {
    const user = await this.userModel.exists({ email });
    return user ? true : false;
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const isEmailExists = await this.isEmailExists(createUserDto.email);
      if (isEmailExists) {
        return GlobalResponse(StatusCodes.BAD_REQUEST, 'Email đã tồn tại');
      }
      const password = createUserDto.password;
      const hashedPassword = await hashPassword(password);
      const user = await this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
      });
      return GlobalResponseData(
        StatusCodes.CREATED,
        ReasonPhrases.CREATED,
        user,
      );
    } catch {
      return GlobalResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(query: any, current: number, pageSize: number) {
    try {
      const { filter, sort } = aqp(query);
      delete filter.current;
      delete filter.pageSize;

      if (filter.email && typeof filter.email === 'string') {
        filter.email = { $regex: filter.email, $options: 'i' };
      } else if (filter.name && typeof filter.name === 'string') {
        filter.name = { $regex: filter.name, $options: 'i' };
      }

      const users = await this.userModel
        .find(filter)
        .skip((current - 1) * pageSize)
        .limit(pageSize)
        .sort(sort as any)
        .select('-password');

      const total = await this.userModel.countDocuments(filter);
      return GlobalResponseData(StatusCodes.OK, ReasonPhrases.OK, {
        users,
        total,
        totalPages: Math.ceil(total / pageSize),
        pageCurrent: current,
      });
    } catch (error) {
      console.error('Error finding users:', error);
      return GlobalResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        return GlobalResponse(StatusCodes.NOT_FOUND, 'User not found');
      }
      return GlobalResponseData(StatusCodes.OK, ReasonPhrases.OK, user);
    } catch (error) {
      console.error('Error finding user:', error);
      return GlobalResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
        new: true,
      });
      if (!user) {
        return GlobalResponse(StatusCodes.NOT_FOUND, 'User not found');
      }
      return GlobalResponseData(StatusCodes.OK, ReasonPhrases.OK, user);
    } catch (error) {
      console.error('Error updating user:', error);
      return GlobalResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      const user = await this.userModel.findByIdAndDelete(id);
      if (!user) {
        return GlobalResponse(StatusCodes.NOT_FOUND, 'User not found');
      }
      return GlobalResponseData(StatusCodes.OK, ReasonPhrases.OK, user);
    } catch (error) {
      console.error('Error removing user:', error);
      return GlobalResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
