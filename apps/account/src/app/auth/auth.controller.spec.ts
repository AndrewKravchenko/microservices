import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq';
import { UserModule } from '../user/user.module';
import { AuthModule } from './auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from '../configs/mongo.config';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import {
  ACCOUNT_LOGIN_TOPIC,
  ACCOUNT_REGISTER_TOPIC,
  AccountLoginRequest,
  AccountLoginResponse,
  AccountRegisterRequest,
  AccountRegisterResponse
} from '@purple/contracts';

const authLogin: AccountLoginRequest = {
  email: 'a@a.ru',
  password: '1'
}

const authRegister: AccountRegisterRequest = {
  ...authLogin,
  displayName: 'Вася'
}

describe('AuthController', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let rmqService: RMQTestService;

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
    await app.init();
  })

  it('Register', async () => {
    const res = await rmqService.triggerRoute<AccountRegisterRequest, AccountRegisterResponse>(
      ACCOUNT_REGISTER_TOPIC,
      authRegister
    );
    expect(res.email).toEqual(authRegister.email);
  });


  it('Login', async () => {
    const res = await rmqService.triggerRoute<AccountLoginRequest, AccountLoginResponse>(
      ACCOUNT_LOGIN_TOPIC,
      authLogin
    );
    expect(res.access_token).toBeDefined();
  });

  afterAll(async () => {
    await userRepository.deleteUser(authRegister.email);
    app.close();
  });
});
