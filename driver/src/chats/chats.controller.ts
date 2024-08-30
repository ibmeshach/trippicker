import {
  ClassSerializerInterceptor,
  Controller,
  HttpException,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomException } from 'src/custom.exception';
import { DriverService } from 'src/driver/driver.service';
import { ChatsService } from './chats.service';
import { RideService } from 'src/ride/ride.service';
import { ChatMessageEntity } from './serializers/chatMessage.serializer';

@Controller('chats')
export class ChatsController {
  constructor(
    private readonly configService: ConfigService,
    private readonly driverService: DriverService,
    private readonly chatsService: ChatsService,
    private readonly rideService: RideService,
  ) {}

  @MessagePattern('driver.saveChatMessage')
  @UseInterceptors(ClassSerializerInterceptor)
  async saveChatMessage(@Payload() { data }: { data: SaveChatMessageProps }) {
    try {
      const ride = await this.rideService.findRideByRideId(data.rideId);

      const createChatData = {
        owner: data.role === 'driver' ? true : false,
        rideKey: data.rideId,
        ride,
        content: data.content,
        driverId: data.driverId,
      };

      const chatMessage = this.chatsService.create(createChatData);
      await chatMessage.save();

      const chatMessageResponse = new ChatMessageEntity(chatMessage);
      return chatMessageResponse;
    } catch (err) {
      console.log(err);
      if (err instanceof CustomException) {
        throw err;
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @MessagePattern('driver.getAllChatMessages')
  @UseInterceptors(ClassSerializerInterceptor)
  async getAllChatMessages(
    @Payload() { data }: { data: { id: string; rideId: string } },
  ) {
    try {
      const chatMessages = await this.chatsService.getAllChatMessages(
        data.id,
        data.rideId,
      );

      return chatMessages;
    } catch (err) {
      console.log(err);
      if (err instanceof CustomException) {
        throw err;
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
