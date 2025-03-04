import { Body, Controller } from '@nestjs/common';
import { ACCOUNT_CHANGE_PROFILE_TOPIC, AccountChangeProfileRequest, AccountChangeProfileResponse, } from '@purple/contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Controller()
export class UserCommands {
  constructor(private readonly userRepository: UserRepository) {}

  @RMQValidate()
  @RMQRoute(ACCOUNT_CHANGE_PROFILE_TOPIC)
  async userInfo(@Body() { user, id }: AccountChangeProfileRequest): Promise<AccountChangeProfileResponse> {
    const existedUser = await this.userRepository.findUserById(id);
    if (!existedUser) {
      throw new Error('Такого пользователя не существует');
    }
    const userEntity = new UserEntity(existedUser).updateProfile(user.displayName);
    await this.userRepository.updateUser(userEntity);
    return {};
  }
}
