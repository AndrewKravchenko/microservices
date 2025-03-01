import { IsEmail, IsOptional, IsString } from 'class-validator';

export const AccountRegisterTopic = 'account.register.command';

export class AccountRegisterRequest {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}

export class AccountRegisterResponse {
  email: string;
}
