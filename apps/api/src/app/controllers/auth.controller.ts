import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import {
  AccountLoginRequest,
  AccountLoginResponse,
  ACCOUNT_LOGIN_TOPIC,
  AccountRegisterRequest,
  AccountRegisterResponse,
  ACCOUNT_REGISTER_TOPIC
} from '@purple/contracts';
import { RMQService } from 'nestjs-rmq';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly rmqService: RMQService
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.rmqService.send<AccountRegisterRequest, AccountRegisterResponse>(ACCOUNT_REGISTER_TOPIC, dto);
    } catch (e) {
      if (e instanceof Error) {
        throw new UnauthorizedException(e.message);
      }
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.rmqService.send<AccountLoginRequest, AccountLoginResponse>(ACCOUNT_LOGIN_TOPIC, dto);
    } catch (e) {
      if (e instanceof Error) {
        throw new UnauthorizedException(e.message);
      }
    }
  }
}
