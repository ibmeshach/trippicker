import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { AuthService } from 'src/auth/services/auth.service';
import { SmsService } from 'src/sms/sms.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ClientsModule.register([
      {
        name: 'DRIVERS',
        transport: Transport.TCP,
        options: {
          // host: 'users-nestjs-backend.railway.internal',
          port: 3002,
        },
      },
    ]),
  ],
  providers: [UserService, AuthService, SmsService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
