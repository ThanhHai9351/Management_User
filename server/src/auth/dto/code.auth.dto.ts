import { IsEmail, IsNotEmpty } from 'class-validator';

export class CodeAuthDto {
  @IsNotEmpty({ message: 'id không được để trống' })
  _id: string;

  @IsNotEmpty({ message: 'code không được để trông' })
  code: string;
}

export class RetryDto {
  @IsNotEmpty({ message: 'email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;
}
