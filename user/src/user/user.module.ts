import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { AuthService } from 'src/auth/services/auth.service';
import { SmsService } from 'src/sms/sms.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, AuthService, SmsService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
