import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('user/get-chats')
  @ApiResponse({
    status: 200,
    description: 'Fetched chats',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiQuery({
    name: 'rideId',
    type: String,
    description: 'Ride ID for which chats are requested',
  })
  async getUserChats(
    @Query('rideId') rideId: string,
    @Req() req: Request,
  ): Promise<any> {
    const userId = req['user'].sub;

    const res = await this.chatService.getUserChats({
      id: userId,
      rideId,
    });

    return res;
  }

  @Get('driver/get-chats')
  @ApiResponse({
    status: 200,
    description: 'Fetched chats',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiQuery({
    name: 'rideId',
    type: String,
    description: 'Ride ID for which chats are requested',
  })
  async getDriverChats(
    @Query('rideId') rideId: string,
    @Req() req: Request,
  ): Promise<any> {
    const driverId = req['user'].sub;

    const res = await this.chatService.getDriverChats({
      id: driverId,
      rideId,
    });

    return res;
  }
}
