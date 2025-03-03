import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import {
  AccountLoginRequest,
  AccountLoginResponse,
  AccountLoginTopic,
  AccountRegisterRequest,
  AccountRegisterResponse,
  AccountRegisterTopic
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
      return await this.rmqService.send<AccountRegisterRequest, AccountRegisterResponse>(AccountRegisterTopic, dto);
    } catch (e) {
      if (e instanceof Error) {
        throw new UnauthorizedException(e.message);
      }
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.rmqService.send<AccountLoginRequest, AccountLoginResponse>(AccountLoginTopic, dto);
    } catch (e) {
      if (e instanceof Error) {
        throw new UnauthorizedException(e.message);
      }
    }
  }
}
