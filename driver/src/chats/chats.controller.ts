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
        rideId: data.rideId,
        ride,
        content: data.content,
        driverId: data.driverId,
      };

      const chatMessage = this.chatsService.create(createChatData);
      await chatMessage.save();
      return true;
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

  @MessagePattern('user.getAllChatMessages')
  @UseInterceptors(ClassSerializerInterceptor)
  async getAllChatMessages(
    @Payload() { data }: { data: { token: string; rideId: string } },
  ) {
    try {
      const secret = this.configService.get<string>('JWT_ACCESS_TOKEN');
      const payload = await this.driverService.decodejwtToken(
        data.token,
        secret,
      );

      if (!payload)
        throw new CustomException(
          'Invalid or expired jwt token',
          HttpStatus.BAD_REQUEST,
        );

      const driverId = payload.sub;

      const chatMessages = await this.chatsService.getAllChatMessages(
        driverId,
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
