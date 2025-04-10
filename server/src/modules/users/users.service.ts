import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { hashPassword } from '@/helpers/bcrypt-password';
import { GlobalResponse, GlobalResponseData } from '@/global/globalResponse';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import aqp from 'api-query-params';
import { RegisterUserDto } from '@/auth/dto/register.dto';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';
import { CodeAuthDto, RetryDto } from '@/auth/dto/code.auth.dto';
const dayjs = require('dayjs');

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) {}

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

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async getUserByEmail(email: string) {
    return await this.userModel.findOne({ email }).select('-password');
  }

  async registerUser(registerDto: RegisterUserDto) {
    try {
      const isEmailExists = await this.isEmailExists(registerDto.email);
      if (isEmailExists) {
        return GlobalResponse(StatusCodes.BAD_REQUEST, 'Email đã tồn tại');
      }
      const codeId = uuidv4();
      const hashedPassword = await hashPassword(registerDto.password);
      const user = await this.userModel.create({
        ...registerDto,
        isActive: false,
        codeId,
        codeExpired: dayjs().add(5, 'minutes'),
        password: hashedPassword,
      });

      await this.mailerService.sendMail({
        to: user.email,
        from: 'Hari',
        subject: 'Active your account at User Management!',
        template: 'register.hbs',
        context: {
          name: user?.name || user?.email,
          activationCode: codeId,
        },
      });
      return user;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async handleActive(data: CodeAuthDto) {
    try {
      const user = await this.userModel.findOne({
        _id: data._id,
        codeId: data.code,
      });
      if (!user) {
        throw new BadRequestException('Mã code không hợp lệ hoặc đã hết hạn!');
      }

      const isBeforeCheck = dayjs().isBefore(user.codeExpired);
      if (!isBeforeCheck) {
        throw new BadRequestException('Mã code đã hết hạn!');
      }
      await this.userModel.findByIdAndUpdate(
        data._id,
        { isActive: true },
        { new: true },
      );
      return data;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async handleRetryCode(data: RetryDto) {
    try {
      const user = await this.getUserByEmail(data.email);
      if (!user) {
        throw new BadRequestException('Không tồn tại người dùng có email này!');
      }
      const codeId = uuidv4();
      await this.userModel.findByIdAndUpdate(
        user._id,
        { codeId, codeExpired: dayjs().add(5, 'minutes') },
        { new: true },
      );
      await this.mailerService.sendMail({
        to: user.email,
        from: 'Hari',
        subject: 'Active your account at User Management!',
        template: 'register.hbs',
        context: {
          name: user?.name || user?.email,
          activationCode: codeId,
        },
      });
      return {
        _id: user._id,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
