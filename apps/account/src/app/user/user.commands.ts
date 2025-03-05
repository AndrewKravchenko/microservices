import { Body, Controller } from '@nestjs/common';
import {
  ACCOUNT_BUY_COURSE_TOPIC,
  ACCOUNT_CHANGE_PROFILE_TOPIC,
  ACCOUNT_CHECK_PAYMENT_TOPIC,
  AccountBuyCourseRequest,
  AccountBuyCourseResponse,
  AccountChangeProfileRequest,
  AccountChangeProfileResponse,
  AccountCheckPaymentRequest,
  AccountCheckPaymentResponse
} from '@purple/contracts';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { BuyCourseSaga } from './sagas/buy-course.saga';

@Controller()
export class UserCommands {
  constructor(private readonly userRepository: UserRepository, private readonly rmqService: RMQService) {
  }

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

  @RMQValidate()
  @RMQRoute(ACCOUNT_BUY_COURSE_TOPIC)
  async buyCourse(@Body() { userId, courseId }: AccountBuyCourseRequest): Promise<AccountBuyCourseResponse> {
    const existedUser = await this.userRepository.findUserById(userId);

    if (!existedUser) {
      throw new Error('Такого пользователя нет');
    }

    const userEntity = new UserEntity(existedUser);
    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);

    const { user, paymentLink } = await saga.getState().pay();
    await this.userRepository.updateUser(user);

    return { paymentLink };
  }

  @RMQValidate()
  @RMQRoute(ACCOUNT_CHECK_PAYMENT_TOPIC)
  async checkPayment(@Body() { userId, courseId }: AccountCheckPaymentRequest): Promise<AccountCheckPaymentResponse> {
    const existedUser = await this.userRepository.findUserById(userId);

    if (!existedUser) {
      throw new Error('Такого пользователя нет');
    }

    const userEntity = new UserEntity(existedUser);
    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);

    const { user, status } = await saga.getState().checkPayment();
    await this.userRepository.updateUser(user);

    return { status };
  }
}
