import { Body, Controller } from '@nestjs/common';
import {
  ACCOUNT_USER_INFO_TOPIC,
  AccountUserInfoRequest,
  AccountUserInfoResponse,
  ACCOUNT_USER_COURSES_TOPIC,
  AccountUserCoursesRequest,
  AccountUserCoursesResponse
} from '@purple/contracts';
import { RMQValidate, RMQRoute } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Controller()
export class UserQueries {
  constructor(private readonly userRepository: UserRepository) {
  }

  @RMQValidate()
  @RMQRoute(ACCOUNT_USER_INFO_TOPIC)
  async userInfo(@Body() { id }: AccountUserInfoRequest): Promise<AccountUserInfoResponse> {
    const user = await this.userRepository.findUserById(id);
    const profile = new UserEntity(user).getPublicProfile();
    return {
      profile
    };
  }

  @RMQValidate()
  @RMQRoute(ACCOUNT_USER_COURSES_TOPIC)
  async userCourses(@Body() { id }: AccountUserCoursesRequest): Promise<AccountUserCoursesResponse> {
    const user = await this.userRepository.findUserById(id);
    return {
      courses: user.courses
    };
  }
}
