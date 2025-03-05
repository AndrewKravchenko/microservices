import { UserEntity } from '../entities/user.entity';
import { PurchaseState } from '@purple/interfaces';
import { BuyCourseSagaState } from './buy-course.state';
import {
  COURSE_GET_COURSE_TOPIC,
  CourseGetCourseRequest,
  CourseGetCourseResponse,
  PAYMENT_CHECK_TOPIC,
  PAYMENT_GENERATE_LINK_TOPIC,
  PaymentCheckRequest,
  PaymentCheckResponse,
  PaymentGenerateLinkRequest,
  PaymentGenerateLinkResponse,
  PaymentStatus
} from '@purple/contracts';

export class BuyCourseSagaStateStarted extends BuyCourseSagaState {
  async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    const { course } = await this.saga.rmqService.send<CourseGetCourseRequest, CourseGetCourseResponse>(COURSE_GET_COURSE_TOPIC, {
      id: this.saga.courseId
    });

    if (!course) {
      throw new Error('Такого курса не существует');
    }

    const courseId = course._id;

    if (course.price === 0) {
      this.saga.setState(PurchaseState.Purchased, courseId);
      return Promise.resolve({ paymentLink: null, user: this.saga.user });
    }

    const { paymentLink } = await this.saga.rmqService.send<PaymentGenerateLinkRequest, PaymentGenerateLinkResponse>(PAYMENT_GENERATE_LINK_TOPIC, {
      courseId: courseId,
      userId: this.saga.user._id,
      sum: course.price
    });

    this.saga.setState(PurchaseState.WaitingForPayment, courseId);
    return Promise.resolve({ paymentLink, user: this.saga.user });
  }

  checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    throw new Error('Нельзя проверить платёж, который не начался');
  }


  async cancel(): Promise<{ user: UserEntity }> {
    this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
    return { user: this.saga.user };
  }
}


export class BuyCourseSagaStateWaitingForPayment extends BuyCourseSagaState {
  pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new Error('Нельзя создать ссылку на оплату в процессе');
  }

  async checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    const { status } = await this.saga.rmqService.send<PaymentCheckRequest, PaymentCheckResponse>(PAYMENT_CHECK_TOPIC, {
      courseId: this.saga.courseId,
      userId: this.saga.user._id
    });

    if (status === 'canceled') {
      this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
      return { user: this.saga.user, status: 'canceled' };
    }
    if (status !== 'success') {
      return { user: this.saga.user, status: 'success' };
    }

    this.saga.setState(PurchaseState.Purchased, this.saga.courseId);

    return { user: this.saga.user, status: 'progress' };
  }

  async cancel(): Promise<{ user: UserEntity }> {
    throw new Error('Нельзя отменить платёж в процессе');
  }
}

export class BuyCourseSagaStatePurchased extends BuyCourseSagaState {
  pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new Error('Нельзя оплатить купленный курс');
  }

  checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    throw new Error('Нельзя проверить платёж по отменённому курсу');
  }

  cancel(): Promise<{ user: UserEntity; }> {
    throw new Error('Нельзя отменить отменённый курс');
  }
}

export class BuyCourseSagaStateCanceled extends BuyCourseSagaState {
  pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    this.saga.setState(PurchaseState.Started, this.saga.courseId);
    return this.saga.getState().pay();
  }

  checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    throw new Error('Нельзя проверить платёж по отменённому курсу');
  }

  cancel(): Promise<{ user: UserEntity; }> {
    throw new Error('Нельзя отменить отменённый курс');
  }
}
