import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsEmail } from 'class-validator';
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsOptional()
  password: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  address: string;

  @IsOptional()
  image: string;
}
