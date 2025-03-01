import { IsEmail, IsString } from 'class-validator';

export const AccountLoginTopic = 'account.login.command';

export class AccountLoginRequest {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class AccountLoginResponse {
  access_token: string;
}
