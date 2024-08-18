import { Inject, Injectable, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ClientProxy } from '@nestjs/microservices';
import { Server, Socket } from 'socket.io';
import { catchError, firstValueFrom } from 'rxjs';
import { GetNearestDriversEvent, UpdateLocationEvent } from './gateway.events';
import { MapsService } from 'src/v1/maps/maps.service';

@WebSocketGateway({ namespace: 'v1/users' })
export class GatewayService {
  configService: any;
  constructor(
    @Inject('USERS') private readonly usersClient: ClientProxy,
    @Inject('DRIVERS') private readonly driversClient: ClientProxy,
    private readonly mapsService: MapsService,
  ) {}

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

  @SubscribeMessage('partialRideDetails')
  async getPartialRideDetails(@MessageBody() data: string) {
    const parsedData: PartialRideDetailsProps = JSON.parse(data);
    console.log(parsedData);

    try {
      const driversObservable = this.driversClient
        .send(
          'driver.getNearestDrivers',
          new GetNearestDriversEvent({
            maxDistance: parsedData.distance,
            userLatitude: parsedData.origin.lat,
            userLongitude: parsedData.origin.lng,
          }),
        )
        .pipe(
          catchError((error) => {
            throw error;
          }),
        );

      const drivers = await firstValueFrom(driversObservable);
      const rideDetails = await this.mapsService.getRideDetails(
        parsedData.origin,
        parsedData.destination,
      );
      return {
        drivers,
        duration: rideDetails.duration,
        range: rideDetails.distance,
        cost: rideDetails.cost,
      };
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  }
}
