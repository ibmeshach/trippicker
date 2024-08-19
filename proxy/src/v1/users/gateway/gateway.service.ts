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
    @MessageBody() data: Partial<UpdateLocationsProps>,
    @ConnectedSocket() socket: Socket,
  ) {
    const token = socket.handshake.headers['authorization'];

    return this.usersClient
      .send(
        'user.updateLocation',
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

  @SubscribeMessage('partialRideDetails')
  async getPartialRideDetails(@MessageBody() data: PartialRideDetailsProps) {
    // console.log('data', data);
    // const parsedData: PartialRideDetailsProps = JSON.parse(data);
    // console.log(parsedData);

    try {
      const driversObservable = this.driversClient
        .send(
          'driver.getNearestDrivers',
          new GetNearestDriversEvent({
            maxDistance: data.distance,
            userLatitude: data.origin.lat,
            userLongitude: data.origin.lng,
          }),
        )
        .pipe(
          catchError((error) => {
            throw error;
          }),
        );

      const drivers = await firstValueFrom(driversObservable);
      const rideDetails = await this.mapsService.getRideDetails(
        data.origin,
        data.destination,
      );
      return {
        drivers,
        duration: rideDetails.duration,
        range: rideDetails.distance,
        cost: rideDetails.cost,
      };
    } catch (error) {
      throw error;
    }
  }
}
