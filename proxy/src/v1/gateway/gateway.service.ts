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
import {
  BookRideEvent,
  GetNearestDriversEvent,
  TrackRideEvent,
  UpdateDriverLocationEvent,
  UpdateUserLocationEvent,
} from './gateway.events';
import { MapsService } from 'src/v1/maps/maps.service';
import { RideService } from '../users/ride/ride.service';
import { EventsService } from '../events/events.service';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({
  namespace: 'v1/events',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class GatewayService implements OnModuleInit {
  private retryCounts: Map<string, number> = new Map();

  configService: any;
  constructor(
    @Inject('USERS') private readonly usersClient: ClientProxy,
    @Inject('DRIVERS') private readonly driversClient: ClientProxy,
    private readonly mapsService: MapsService,
    private readonly rideService: RideService,
    private readonly eventsService: EventsService
  ) {}

  onModuleInit() {
    this.eventsService.rideRequested$.subscribe(payload => {
      this.requestRide(payload);
    });
  }
  @WebSocketServer() server: Server;

  @SubscribeMessage('trackRide')
  async trackRide(@MessageBody() data: any) {
    let parsedData: { rideId: string };
    if (typeof data == 'string') {
      parsedData = JSON.parse(data);
    } else {
      parsedData = data;
    }

    const observableDriverDetails = this.driversClient
      .send(
        'driver.trackRide',
        new TrackRideEvent({
          rideId: parsedData.rideId,
        })
      )
      .pipe(
        catchError(error => {
          throw error;
        })
      );

    const observableUserDetails = this.usersClient
      .send(
        'user.trackRide',
        new TrackRideEvent({
          rideId: parsedData.rideId,
        })
      )
      .pipe(
        catchError(error => {
          throw error;
        })
      );

    const driverDetails = await firstValueFrom(observableDriverDetails);
    const userDetails = await firstValueFrom(observableUserDetails);

    this.server.emit(`trackRide:${parsedData.rideId}:${driverDetails.id}`, {
      ride: driverDetails.ride,
      driverLocatin: driverDetails.location,
      userLocation: userDetails.location,
    });

    this.server.emit(`trackRide:${parsedData.rideId}:${userDetails.id}`, {
      ride: driverDetails.ride,
      driverLocatin: driverDetails.location,
      userLocation: userDetails.location,
    });
  }

  @SubscribeMessage('user.updateLocation')
  async userUpdateLocation(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket
  ) {
    let parsedData: Partial<UpdateLocationsProps>;
    if (typeof data == 'string') {
      parsedData = JSON.parse(data);
    } else {
      parsedData = data;
    }

    const token = socket.handshake.headers['authorization'];

    const observable = this.usersClient
      .send(
        'user.updateLocation',
        new UpdateUserLocationEvent({
          token,
          address: parsedData.address,
          currentLatitude: parsedData.currentLatitude,
          currentLongitude: parsedData.currentLongitude,
        })
      )
      .pipe(
        catchError(error => {
          throw error;
        })
      );

    const value = await firstValueFrom(observable);

    console.log(value);

    return value;
  }

  requestRideResponse(payload: RequestRideGatewayProps): void {
    this.server.emit(`user.rideRequestResponse:${payload.user.id}`, payload);
  }

  @SubscribeMessage('user.partialRideDetails')
  async getPartialRideDetails(@MessageBody() data: any) {
    let parsedData: PartialRideDetailsProps;

    if (typeof data == 'string') {
      parsedData = JSON.parse(data);
    } else {
      parsedData = data;
    }

    try {
      const driversObservable = this.driversClient
        .send(
          'driver.getNearestDrivers',
          new GetNearestDriversEvent({
            maxDistance: parsedData.distance,
            userLatitude: parsedData.origin.lat,
            userLongitude: parsedData.origin.lng,
          })
        )
        .pipe(
          catchError(error => {
            throw error;
          })
        );

      const drivers = await firstValueFrom(driversObservable);
      const rideDetails = await this.mapsService.getRideDetails(
        parsedData.origin,
        parsedData.destination
      );

      console.log('partialrides', {
        drivers,
        duration: rideDetails.duration,
        range: rideDetails.distance,
        cost: rideDetails.cost,
      });

      return {
        drivers,
        duration: rideDetails.duration,
        range: rideDetails.distance,
        cost: rideDetails.cost,
        originAddress: parsedData.originAddress,
        destinationAddresses: parsedData.destinationAddresses,
      };
    } catch (error) {
      throw error;
    }
  }

  // driver

  @SubscribeMessage('driver.updateLocation')
  async driverUpdateLocation(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket
  ) {
    let parsedData: Partial<UpdateLocationsProps>;

    if (typeof data == 'string') {
      parsedData = JSON.parse(data);
    } else {
      parsedData = data;
    }
    const token = socket.handshake.headers['authorization'];

    return this.driversClient
      .send(
        'driver.updateLocation',
        new UpdateDriverLocationEvent({
          token,
          address: parsedData.address,
          currentLatitude: parsedData.currentLatitude,
          currentLongitude: parsedData.currentLongitude,
        })
      )
      .pipe(
        catchError(error => {
          throw error;
        })
      );
  }

  @SubscribeMessage('driver.driverRideResponse')
  async driverRideResponse(@MessageBody() data: string) {
    let parsedData: DriverRideResponseProps;

    if (typeof data == 'string') {
      parsedData = JSON.parse(data);
    } else {
      parsedData = data;
    }

    const userId = parsedData.user.id;
    const currentRetryCount = this.retryCounts.get(userId) || 0;
    const rideId = this.generateRideId();

    if (parsedData.action) {
      this.retryCounts.set(userId, 0);
      const observableDriverRide = this.driversClient
        .send(
          'driver.acceptedRide',
          new BookRideEvent({
            rideId,
            ...parsedData,
          })
        )
        .pipe(
          catchError(error => {
            throw error;
          })
        );

      const observableUserRide = this.usersClient
        .send('user.acceptedRide', new BookRideEvent({ rideId, ...parsedData }))
        .pipe(
          catchError(error => {
            throw error;
          })
        );

      const driverRide = await firstValueFrom(observableDriverRide);
      const userRide = await firstValueFrom(observableUserRide);

      this.requestRideResponse(userRide);
      return driverRide;
    } else {
      if (currentRetryCount < 3) {
        this.retryCounts.set(userId, currentRetryCount + 1);

        return await this.rideService.requestRide({
          id: userId,
          driverId: parsedData.driver.id,
          cost: parsedData.cost,
          range: parsedData.range,
          duration: parsedData.duration,
          origin: parsedData.origin,
          destination: parsedData.destination,
          originAddress: parsedData.originAddress,
          destinationAddresses: parsedData.destinationAddresses,
        });
      } else {
        this.retryCounts.set(userId, 0);
        return 'Max retry attempts reached for user';
      }
    }
  }

  requestRide(payload: RequestRideGatewayProps): void {
    this.server.emit(`driver.rideRequest:${payload.driver.id}`, payload);
  }

  private generateRideId(): string {
    const timestamp = Date.now().toString(); // Get current timestamp
    const randomValue = uuidv4(); // Generate a random UUID for additional uniqueness
    const combined = `${timestamp}-${randomValue}`; // Combine the timestamp and UUID
    return Buffer.from(combined).toString('base64'); // Convert the combined string to Base64
  }
}
