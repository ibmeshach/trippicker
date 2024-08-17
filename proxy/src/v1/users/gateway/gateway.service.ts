import { Inject, Injectable, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ClientProxy } from '@nestjs/microservices';
import { Server, Socket } from 'socket.io';
import { catchError } from 'rxjs';
import { UpdateLocationEvent } from './gateway.events';

@WebSocketGateway({ namespace: 'v1/users' })
export class GatewayService {
  configService: any;
  constructor(@Inject('USERS') private readonly usersClient: ClientProxy) {}

  @SubscribeMessage('updateLocation')
  async updateLocation(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const token = socket.handshake.headers['authorization'];
    const parsedData: UpdateLocationsProps = JSON.parse(data);
    console.log(parsedData);

    return this.usersClient
      .send(
        'user.updateLocation',
        new UpdateLocationEvent({
          token,
          address: parsedData.address,
          currentLatitude: parsedData.currentLatitude,
          currentLongitude: parsedData.currentLongitude,
        }),
      )
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }
}
