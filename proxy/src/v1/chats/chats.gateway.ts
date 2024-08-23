import { Inject, OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ClientProxy } from '@nestjs/microservices';
import { Server, Socket } from 'socket.io';
import { catchError, firstValueFrom } from 'rxjs';
import { MapsService } from 'src/v1/maps/maps.service';
import { RideService } from '../users/ride/ride.service';
import { EventsService } from '../events/events.service';
import { SaveChatMessageEvent } from '../chats/chat.events';
import {
  GetNearestDriversEvent,
  UpdateDriverLocationEvent,
  UpdateUserLocationEvent,
} from '../gateway/gateway.events';

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
  private retryCounts: Map<string, number> = new Map();

  configService: any;
  constructor(
    @Inject('USERS') private readonly usersClient: ClientProxy,
    @Inject('DRIVERS') private readonly driversClient: ClientProxy,
    private readonly mapsService: MapsService,
    private readonly rideService: RideService,
    private readonly eventsService: EventsService,
  ) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('user.updateLocation')
  async userUpdateLocation(
    @MessageBody() data: Partial<UpdateLocationsProps>,
    @ConnectedSocket() socket: Socket,
  ) {
    const token = socket.handshake.headers['authorization'];

    const observable = this.driversClient
      .send(
        'driver.saveChatMessage',
        new UpdateUserLocationEvent({
          token,
          address: data.address,
          currentLatitude: data.currentLatitude,
          currentLongitude: data.currentLongitude,
        }),
      )
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    const value = await firstValueFrom(observable);

    console.log(value);

    return value;
  }

  requestRideResponse(payload: RequestRideGatewayProps): void {
    this.server.emit(`user.rideRequestResponse:${payload.user.id}`, payload);
  }

  // driver

  @SubscribeMessage('driver.updateLocation')
  async driverUpdateLocation(
    @MessageBody() data: Partial<UpdateLocationsProps>,
    @ConnectedSocket() socket: Socket,
  ) {
    const token = socket.handshake.headers['authorization'];

    return this.driversClient
      .send(
        'driver.updateLocation',
        new UpdateDriverLocationEvent({
          token,
          address: data.address,
          currentLatitude: data.currentLatitude,
          currentLongitude: data.currentLongitude,
        }),
      )
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }
}
