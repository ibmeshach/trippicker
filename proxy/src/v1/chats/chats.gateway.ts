import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { catchError } from 'rxjs';
import { SaveChatMessageEvent } from './chat.events';

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
    const { role, rideId, userId, driverId } = client.handshake.query;

    const roomId = `${userId}:${driverId}`;

    client.data = { token, role, rideId };
    client.join(roomId);
  }

  @SubscribeMessage('message')
  handleMessage(
    client: Socket,
    payload: { roomId: string; message: string },
  ): void {
    const { roomId, message } = payload;
    const { token, role, rideId } = client.data;

    console.log('get here first', payload);

    // Ensure that the observables are subscribed to
    this.driversClient
      .send(
        'driver.saveChatMessage',
        new SaveChatMessageEvent({
          token,
          role,
          rideId: rideId,
          content: message,
        }),
      )
      .pipe(
        catchError((error) => {
          console.error('Error sending message to drivers service:', error);
          throw error;
        }),
      )
      .subscribe({
        next: (response) => console.log('Driver service response:', response),
        error: (error) => console.error('Driver service error:', error),
      });

    this.usersClient
      .send(
        'user.saveChatMessage',
        new SaveChatMessageEvent({
          token,
          role,
          rideId: rideId,
          content: message,
        }),
      )
      .pipe(
        catchError((error) => {
          console.error('Error sending message to users service:', error);
          throw error;
        }),
      )
      .subscribe({
        next: (response) => console.log('User service response:', response),
        error: (error) => console.error('User service error:', error),
      });

    console.log('get here second and last');
    this.server.to(roomId).emit('message', { message });
  }
}
