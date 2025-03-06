import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AccountLoginRequest,
  AccountLoginResponse,
  ACCOUNT_LOGIN_TOPIC,
  AccountRegisterRequest,
  AccountRegisterResponse,
  ACCOUNT_REGISTER_TOPIC
} from '@purple/contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {
  }

  @RMQValidate()
  @RMQRoute(ACCOUNT_REGISTER_TOPIC)
  async register(@Body() dto: AccountRegisterRequest): Promise<AccountRegisterResponse> {
    return this.authService.register(dto);
  }

  @RMQValidate()
  @RMQRoute(ACCOUNT_LOGIN_TOPIC)
  async login(@Body() { email, password }: AccountLoginRequest): Promise<AccountLoginResponse> {
    const { id } = await this.authService.validateUser(email, password);
    return this.authService.login(id);
  }
}
