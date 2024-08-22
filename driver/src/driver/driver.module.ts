import { Logger, Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from 'src/entities/driver.entity';
import { DriverController } from './driver.controller';
import { SmsService } from 'src/sms/sms.service';
import { RedisConfigService } from 'src/config/redis.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RideService } from 'src/ride/ride.service';
import { Ride } from 'src/entities/rides.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/entities/user.entity';
import { ChatsService } from 'src/chats/chats.service';
import { ChatMessage } from 'src/entities/chatMessage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Driver, Ride, User, ChatMessage]),
    ClientsModule.register([
      {
        name: 'USERS',
        transport: Transport.TCP,
        options: {
          // host: 'drivers-nestjs-backend.railway.internal',
          port: 3001,
        },
      },
    ]),
  ],
  providers: [
    DriverService,
    SmsService,
    RedisConfigService,
    RideService,
    UserService,
    ChatsService,
  ],
  controllers: [DriverController],
})
export class DriverModule {}
