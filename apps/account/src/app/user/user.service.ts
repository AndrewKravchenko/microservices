import { Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { RMQService } from 'nestjs-rmq';
import { IUser } from '@purple/interfaces';
import { UserEventEmitter } from './user.event-emitter';
import { BuyCourseSaga } from './sagas/buy-course.saga';


@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService,
    private readonly userEventEmitter: UserEventEmitter
  ) {
  }

  async changeProfile(user: Pick<IUser, 'displayName'>, id: string) {
    const existedUser = await this.userRepository.findUserById(id);
    if (!existedUser) {
      throw new Error('Такого пользователя не существует');
    }
    const userEntity = new UserEntity(existedUser).updateProfile(user.displayName);
    await this.updateUser(userEntity);
    return {};
  }

  async buyCourse(userId: string, courseId: string) {
    const existedUser = await this.userRepository.findUserById(userId);

    if (!existedUser) {
      throw new Error('Такого пользователя нет');
    }

    const userEntity = new UserEntity(existedUser);
    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);

    const { user, paymentLink } = await saga.getState().pay();
    await this.updateUser(user);

    return { paymentLink };
  }

  async checkPayments(userId: string, courseId: string) {
    const existedUser = await this.userRepository.findUserById(userId);

    if (!existedUser) {
      throw new Error('Такого пользователя нет');
    }

    const userEntity = new UserEntity(existedUser);
    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);

    const { user, status } = await saga.getState().checkPayment();
    await this.updateUser(user);

    return { status };
  }

  private updateUser(user: UserEntity) {
    return Promise.all([
      this.userEventEmitter.handle(user),
      this.userRepository.updateUser(user)
    ]);
  }
}
