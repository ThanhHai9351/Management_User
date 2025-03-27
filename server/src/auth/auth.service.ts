import { Injectable } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { comparePassword } from '@/helpers/bcrypt-password';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { GlobalResponse, GlobalResponseData } from '@/global/globalResponse';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(username);
      if (!user) {
        return GlobalResponse(
          StatusCodes.UNAUTHORIZED,
          ReasonPhrases.UNAUTHORIZED,
        );
      }
      if (!(await comparePassword(password, user.password))) {
        return GlobalResponse(StatusCodes.UNAUTHORIZED, 'Password not match');
      }
      const payload = { email: user.email, _id: user._id, role: user.role };
      return GlobalResponseData(StatusCodes.OK, ReasonPhrases.OK, {
        access_token: await this.jwtService.signAsync(payload),
      });
    } catch {
      return GlobalResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await comparePassword(password, user.password))) {
      return user;
    }
    return null;
  }
}
