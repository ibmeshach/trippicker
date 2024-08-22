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
    const { token, role, roomId } = client.handshake.query;
    client.data = { token, role };
    client.join(roomId);
  }

  @SubscribeMessage('message')
  handleMessage(
    client: Socket,
    payload: { roomId: string; message: string },
  ): void {
    const { roomId, message } = payload;
    const { token, role } = client.data;

    console.log('get here first', payload);
    this.driversClient
      .send(
        'driver.saveChatMessage',
        new SaveChatMessageEvent({
          token,
          role,
          rideId: roomId,
          content: message,
        }),
      )
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    this.usersClient
      .send(
        'user.saveChatMessage',
        new SaveChatMessageEvent({
          token,
          role,
          rideId: roomId,
          content: message,
        }),
      )
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    console.log('get here second and last');
    this.server.to(roomId).emit('message', { message });
  }
}
