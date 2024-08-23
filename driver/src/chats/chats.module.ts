import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from 'src/entities/chatMessage.entity';
import { ChatsController } from './chats.controller';
import { DriverService } from 'src/driver/driver.service';
import { Driver } from 'src/entities/driver.entity';
import { RedisConfigService } from 'src/config/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, Driver])],
  providers: [ChatsService, DriverService, RedisConfigService],
  controllers: [ChatsController],
})
export class ChatsModule {}
