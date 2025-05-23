import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '@/auth/passport/local-auth.guard';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { Public, ResponseMessage } from '@/decorator/customize';
import { RegisterUserDto } from '@/auth/dto/register.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { CodeAuthDto, RetryDto } from '@/auth/dto/code.auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Fetch Login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Post('register')
  @ResponseMessage('Fetch Register')
  register(@Body() registerDto: RegisterUserDto) {
    return this.authService.registerUser(registerDto);
  }

  @Public()
  @Post('check-code')
  @ResponseMessage('Fetch code')
  checkCode(@Body() CodeAuthDto: CodeAuthDto) {
    return this.authService.checkCode(CodeAuthDto);
  }

  @Public()
  @Post('retry-active')
  @ResponseMessage('Fetch code')
  retryActive(@Body() retrydto: RetryDto) {
    return this.authService.retryCode(retrydto);
  }

  @Public()
  @Get('mail')
  async testMail() {
    try {
      const mail = await this.mailerService.sendMail({
        to: 'thanhhaihuit2k3@gmail.com', // list of receivers
        from: 'Hari', // sender address
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome 1', // plaintext body
        template: 'register.hbs',
        context: {
          name: 'Thanh Hải',
          activationCode: 135151351,
        },
      });
      return mail;
    } catch (error) {
      console.log(error);
    }
  }
}
