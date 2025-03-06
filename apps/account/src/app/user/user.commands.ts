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
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { UserService } from './user.service';

@Controller()
export class UserCommands {
  constructor(private readonly userService: UserService) {}

  @RMQValidate()
  @RMQRoute(ACCOUNT_CHANGE_PROFILE_TOPIC)
  async changeProfile(@Body() { user, id }: AccountChangeProfileRequest): Promise<AccountChangeProfileResponse> {
    return this.userService.changeProfile(user, id);
  }

  @RMQValidate()
  @RMQRoute(ACCOUNT_BUY_COURSE_TOPIC)
  async buyCourse(@Body() { userId, courseId }: AccountBuyCourseRequest): Promise<AccountBuyCourseResponse> {
    return this.userService.buyCourse(userId, courseId);
  }

  @RMQValidate()
  @RMQRoute(ACCOUNT_CHECK_PAYMENT_TOPIC)
  async checkPayment(@Body() { userId, courseId }: AccountCheckPaymentRequest): Promise<AccountCheckPaymentResponse> {
    return this.userService.checkPayments(userId, courseId);
  }
}
