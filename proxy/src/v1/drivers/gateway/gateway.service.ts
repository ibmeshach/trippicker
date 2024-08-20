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
import { BookRideEvent, UpdateLocationEvent } from './gateway.events';
import { catchError, firstValueFrom } from 'rxjs';
import { RideService } from 'src/v1/users/ride/ride.service';
import { UsersGatewayService } from 'src/v1/users/gateway/gateway.service';

@WebSocketGateway({ namespace: 'v1/drivers' })
export class DriversGatewayService {
  private retryCounts: Map<string, number> = new Map();

  configService: any;
  constructor(
    @Inject('USERS') private readonly usersClient: ClientProxy,
    @Inject('DRIVERS') private readonly driversClient: ClientProxy,
    private readonly userGatewayService: UsersGatewayService,
    private readonly rideService: RideService,
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

  @SubscribeMessage('driverRideResponse')
  async driverRideResponse(@MessageBody() data: DriverRideResponseProps) {
    const userId = data.user.id;
    const currentRetryCount = this.retryCounts.get(userId) || 0;

    if (data.action) {
      this.retryCounts.set(userId, 0);
      const observableDriverRide = this.driversClient
        .send('driver.acceptedRide', new BookRideEvent(data))
        .pipe(
          catchError((error) => {
            throw error;
          }),
        );

      const observableUserRide = this.usersClient
        .send('user.acceptedRide', new BookRideEvent(data))
        .pipe(
          catchError((error) => {
            throw error;
          }),
        );

      const driverRide = await firstValueFrom(observableDriverRide);
      const userRide = await firstValueFrom(observableUserRide);

      this.userGatewayService.requestRideResponse(userRide);

      console.log(userRide, 'user ride');
      console.log(driverRide, 'driver ride');

      return userRide;
    } else {
      if (currentRetryCount < 3) {
        this.retryCounts.set(userId, currentRetryCount + 1);

        return await this.rideService.requestRide({
          id: userId,
          driverId: data.driver.id,
          cost: data.cost,
          range: data.range,
          duration: data.duration,
          origin: data.origin,
          destination: data.destination,
        });
      } else {
        this.retryCounts.set(userId, 0);
        return 'Max retry attempts reached for user';
      }
    }
  }

  requestRide(payload: RequestRideGatewayProps): void {
    this.server.emit(`rideRequest:${payload.driver.id}`, payload);
  }
}
