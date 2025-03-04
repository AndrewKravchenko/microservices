import { IUser } from '@purple/interfaces';
import { IsString } from 'class-validator';

export const ACCOUNT_USER_INFO_TOPIC = 'account.user-info.query';

export class AccountUserInfoRequest {
  @IsString()
  id: string;
}

export class AccountUserInfoResponse {
  profile: Omit<IUser, 'passwordHash'>;
}
