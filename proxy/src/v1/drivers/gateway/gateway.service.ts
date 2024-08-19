import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MapsService } from 'src/v1/maps/maps.service';
import { UpdateLocationEvent } from './gateway.events';
import { catchError } from 'rxjs';

@WebSocketGateway({ namespace: 'v1/drivers' })
export class GatewayService {
  configService: any;
  constructor(
    @Inject('USERS') private readonly usersClient: ClientProxy,
    @Inject('DRIVERS') private readonly driversClient: ClientProxy,
    private readonly mapsService: MapsService,
  ) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('updateLocation')
  async updateLocation(
    @MessageBody() data: Partial<UpdateLocationsProps>,
    @ConnectedSocket() socket: Socket,
  ) {
    const token = socket.handshake.headers['authorization'];

    return this.driversClient
      .send(
        'driver.updateLocation',
        new UpdateLocationEvent({
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

  requestRide(payload: RequestRideProps): void {
    this.server.emit(`rideRequest:${payload.driver.id}`, payload);
  }
}
