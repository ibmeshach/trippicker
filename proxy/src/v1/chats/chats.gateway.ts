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
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    @Inject('USERS') private readonly usersClient: ClientProxy,
    @Inject('DRIVERS') private readonly driversClient: ClientProxy,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.headers['authorization'];

    console.log(token);
    const { role, rideId, driverId, userId } = client.handshake.query;

    client.data = { role, rideId, userId, driverId };
    client.join(rideId);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: { message: string }) {
    const { message } = payload;
    const { driverId, userId, role, rideId } = client.data;

    console.log('get here first', payload);

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
            }),
          )
          .pipe(
            catchError((error) => {
              console.error('Error sending message to drivers service:', error);
              throw error;
            }),
          ),
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
            }),
          )
          .pipe(
            catchError((error) => {
              console.error('Error sending message to users service:', error);
              throw error;
            }),
          ),
      );

      console.log('User service response:', userChat);

      console.log('get here second and last');

      this.server.to(rideId).emit(`message:${driverId}`, driverChat);
      this.server.to(rideId).emit(`message:${userId}`, userChat);
    } catch (error) {
      console.error('Error processing chat message:', error);
      // Optionally, you can notify the client of the error
      client.emit('error', { message: 'Failed to send message' });
    }
  }
}
