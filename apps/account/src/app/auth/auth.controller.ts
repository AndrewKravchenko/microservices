import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AccountLoginRequest,
  AccountLoginResponse,
  AccountLoginTopic,
  AccountRegisterRequest,
  AccountRegisterResponse,
  AccountRegisterTopic
} from '@purple/contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {
  }

  @RMQValidate()
  @RMQRoute(AccountRegisterTopic)
  async register(@Body() dto: AccountRegisterRequest): Promise<AccountRegisterResponse> {
    return this.authService.register(dto);
  }

  @RMQValidate()
  @RMQRoute(AccountLoginTopic)
  async login(@Body() { email, password }: AccountLoginRequest): Promise<AccountLoginResponse> {
    const { id } = await this.authService.validateUser(email, password);
    return this.authService.login(id);
  }
}
