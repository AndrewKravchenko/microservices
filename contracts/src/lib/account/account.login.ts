import { IsEmail, IsString } from 'class-validator';

export const ACCOUNT_LOGIN_TOPIC = 'account.login.command';

export class AccountLoginRequest {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class AccountLoginResponse {
  access_token: string;
}
