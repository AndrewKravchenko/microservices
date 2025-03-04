import { IUser } from '@purple/interfaces';
import { IsString } from 'class-validator';

export const ACCOUNT_CHANGE_PROFILE_TOPIC = 'account.change-profile.command';

export class AccountChangeProfileRequest {
  @IsString()
  id: string;

  @IsString()
  user: Pick<IUser, 'displayName'>;
}

export class AccountChangeProfileResponse {}
