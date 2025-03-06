import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq';
import { UserModule } from './user.module';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from '../configs/mongo.config';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import {
  ACCOUNT_BUY_COURSE_TOPIC,
  ACCOUNT_CHECK_PAYMENT_TOPIC,
  ACCOUNT_LOGIN_TOPIC,
  ACCOUNT_REGISTER_TOPIC,
  ACCOUNT_USER_INFO_TOPIC,
  AccountBuyCourseRequest,
  AccountBuyCourseResponse,
  AccountCheckPaymentRequest,
  AccountCheckPaymentResponse,
  AccountLoginRequest,
  AccountLoginResponse,
  AccountRegisterRequest,
  AccountRegisterResponse,
  AccountUserInfoRequest,
  AccountUserInfoResponse,
  COURSE_GET_COURSE_TOPIC,
  CourseGetCourseResponse,
  PAYMENT_CHECK_TOPIC,
  PAYMENT_GENERATE_LINK_TOPIC,
  PaymentCheckResponse,
  PaymentGenerateLinkResponse
} from '@purple/contracts';
import { verify } from 'jsonwebtoken';

const authLogin: AccountLoginRequest = {
  email: 'a2@a.ru',
  password: '1'
}

const authRegister: AccountRegisterRequest = {
  ...authLogin,
  displayName: 'Вася'
}

const courseId = 'courseId';

describe('UserController', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let rmqService: RMQTestService;
  let configService: ConfigService;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.account.env' }),
        RMQModule.forTest({}),
        UserModule,
        AuthModule,
        MongooseModule.forRootAsync(getMongoConfig())
      ]
    }).compile();
    app = module.createNestApplication();
    userRepository = app.get<UserRepository>(UserRepository);
    rmqService = app.get(RMQService);
    configService = app.get<ConfigService>(ConfigService);
    await app.init();


    await rmqService.triggerRoute<AccountRegisterRequest, AccountRegisterResponse>(
      ACCOUNT_REGISTER_TOPIC,
      authRegister
    );
    const { access_token } = await rmqService.triggerRoute<AccountLoginRequest, AccountLoginResponse>(
      ACCOUNT_LOGIN_TOPIC,
      authLogin
    );
    token = access_token;
    const data = verify(token, configService.get('JWT_SECRET'));
    userId = data['id'];
  })


  it('AccountUserInfo', async () => {
    const res = await rmqService.triggerRoute<AccountUserInfoRequest, AccountUserInfoResponse>(
      ACCOUNT_USER_INFO_TOPIC,
      { id: userId }
    );
    expect(res.profile.displayName).toEqual(authRegister.displayName);
  });

  it('BuyCourse', async () => {
    const paymentLink = 'paymentLink';
    rmqService.mockReply<CourseGetCourseResponse>(COURSE_GET_COURSE_TOPIC, {
      course: {
        _id: courseId,
        price: 1000
      }
    });
    rmqService.mockReply<PaymentGenerateLinkResponse>(PAYMENT_GENERATE_LINK_TOPIC, {
      paymentLink
    });
    const res = await rmqService.triggerRoute<AccountBuyCourseRequest, AccountBuyCourseResponse>(
      ACCOUNT_BUY_COURSE_TOPIC,
      { userId, courseId }
    );
    expect(res.paymentLink).toEqual(paymentLink);
    await expect(
      rmqService.triggerRoute<AccountBuyCourseRequest, AccountBuyCourseResponse>(
        ACCOUNT_BUY_COURSE_TOPIC,
        { userId, courseId }
      )
    ).rejects.toThrowError();
  });

  it('BuyCourse', async () => {
    rmqService.mockReply<PaymentCheckResponse>(PAYMENT_CHECK_TOPIC, {
      status: 'success'
    });
    const res = await rmqService.triggerRoute<AccountCheckPaymentRequest, AccountCheckPaymentResponse>(
      ACCOUNT_CHECK_PAYMENT_TOPIC,
      { userId, courseId }
    );
    expect(res.status).toEqual('success');
  });

  afterAll(async () => {
    await userRepository.deleteUser(authRegister.email);
    app.close();
  });
});
