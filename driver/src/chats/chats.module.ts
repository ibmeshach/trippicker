import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from 'src/entities/chatMessage.entity';
import { ChatsController } from './chats.controller';
import { DriverService } from 'src/driver/driver.service';
import { Driver } from 'src/entities/driver.entity';
import { RedisConfigService } from 'src/config/redis.service';
import { RideService } from 'src/ride/ride.service';
import { Ride } from 'src/entities/rides.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, Driver, Ride])],
  providers: [ChatsService, DriverService, RedisConfigService, RideService],
  controllers: [ChatsController],
})
export class ChatsModule {}
