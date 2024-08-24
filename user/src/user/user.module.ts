import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { AuthService } from 'src/auth/services/auth.service';
import { SmsService } from 'src/sms/sms.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RideService } from 'src/ride/ride.service';
import { Ride } from 'src/entities/rides.entity';
import { ChatMessage } from 'src/entities/chatMessage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Ride]),
    ClientsModule.register([
      {
        name: 'DRIVERS',
        transport: Transport.TCP,
        options: {
          host: 'drivers-nestjs-backend.railway.internal',
          port: 3002,
        },
      },
    ]),
  ],
  providers: [UserService, AuthService, SmsService, RideService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
