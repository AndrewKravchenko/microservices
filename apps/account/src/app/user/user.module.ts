import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { UserRepository } from './repositories/user.repository';
import { UserEventEmitter } from './user.event-emitter';
import { UserService } from './user.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema }
  ])],
  providers: [UserRepository, UserEventEmitter, UserService],
  exports: [UserRepository]
})

export class UserModule {}
