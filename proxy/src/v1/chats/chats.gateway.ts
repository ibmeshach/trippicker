import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { catchError, firstValueFrom } from 'rxjs';
import {
  DriverSaveChatMessageEvent,
  UserSaveChatMessageEvent,
} from './chat.events';

@WebSocketGateway({
  namespace: 'v1/events/chat',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(
    @Inject('USERS') private readonly usersClient: ClientProxy,
    @Inject('DRIVERS') private readonly driversClient: ClientProxy
  ) {}

  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    payload: {
      message: string;
      rideId: string;
      role: string;
      driverId: string;
      userId: string;
    }
  ) {
    const { message, rideId, driverId, role, userId } = payload;

    console.log('get here first', payload);

    console.log(
      {
        userId,
        rideId,
        role,
        driverId,
      },
      'client-data'
    );

    try {
      // Handling the driver chat
      const driverChat = await firstValueFrom(
        this.driversClient
          .send(
            'driver.saveChatMessage',
            new DriverSaveChatMessageEvent({
              driverId,
              role,
              rideId,
              content: message,
            })
          )
          .pipe(
            catchError(error => {
              console.error('Error sending message to drivers service:', error);
              throw error;
            })
          )
      );

      console.log('Driver service response:', driverChat);

      // Handling the user chat
      const userChat = await firstValueFrom(
        this.usersClient
          .send(
            'user.saveChatMessage',
            new UserSaveChatMessageEvent({
              userId,
              role,
              rideId,
              content: message,
            })
          )
          .pipe(
            catchError(error => {
              console.error('Error sending message to users service:', error);
              throw error;
            })
          )
      );

      console.log('User service response:', userChat);

      console.log('get here second and last');

      this.server.emit(`message:${rideId}:${driverId}`, driverChat);
      this.server.emit(`message:${rideId}:${userId}`, userChat);
    } catch (error) {
      console.error('Error processing chat message:', error);
      // Optionally, you can notify the client of the error
      client.emit('error', { message: 'Failed to send message' });
    }
  }
}
