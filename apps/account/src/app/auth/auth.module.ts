import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { getJWTConfig } from '../configs/jwt.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UserModule, JwtModule.registerAsync(getJWTConfig())],
  controllers: [AuthController],
  providers: [AuthService],
})

export class AuthModule {}
