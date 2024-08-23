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
import { UserService } from 'src/user/user.service';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly chatsService: ChatsService,
  ) {}

  // handle chat messages
  @MessagePattern('user.saveChatMessage')
  @UseInterceptors(ClassSerializerInterceptor)
  async saveChatMessage(@Payload() { data }: { data: SaveChatMessageProps }) {
    try {
      const secret = this.configService.get<string>('JWT_ACCESS_TOKEN');
      const payload = await this.userService.decodejwtToken(data.token, secret);

      if (!payload)
        throw new CustomException(
          'Invalid or expired jwt token',
          HttpStatus.BAD_REQUEST,
        );

      const userId = payload.sub;

      const createChatData = {
        owner: data.role === 'user' ? true : false,
        rideId: data.rideId,
        content: data.content,
        userId: userId,
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
      const payload = await this.userService.decodejwtToken(data.token, secret);

      if (!payload)
        throw new CustomException(
          'Invalid or expired jwt token',
          HttpStatus.BAD_REQUEST,
        );

      const chatMessages = await this.chatsService.getAllChatMessages(
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
