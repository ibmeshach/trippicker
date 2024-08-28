import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import {
  CancelRideEvent,
  ClosestDriverEvent,
  GetRideEvent,
  GetRidesEvent,
} from './ride.events';
import { GatewayService } from 'src/v1/gateway/gateway.service';
import { EventsService } from 'src/v1/events/events.service';

@Injectable()
export class RideService {
  constructor(
    @Inject('DRIVERS') private readonly driversClient: ClientProxy,
    @Inject('USERS') private readonly usersClient: ClientProxy,
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
  ) {}

  async requestRide(body: RideRequestProps) {
    const observableData = this.driversClient
      .send(
        'driver.closestDriver',
        new ClosestDriverEvent({
          userId: body.id,
          origin: body.origin,
          driverId: body.driverId,
        }),
      )
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    const { user, driver } = await firstValueFrom(observableData);

    this.eventsService.emitRideRequested({
      cost: body.cost,
      range: body.range,
      duration: body.duration,
      origin: body.origin,
      destination: body.destination,
      driver: driver,
      user: user,
      originAddress: body.originAddress,
      destinationAddresses: body.destinationAddresses,
    });
  }

  async cancelRide(body: CancelRideProps) {
    console.log('get here', body);
    const observableData = this.usersClient
      .send('user.cancelRide', new CancelRideEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    await firstValueFrom(observableData);
  }

  async getRides(body: GetRidesProps) {
    const observableData = this.usersClient
      .send('user.rideHistories', new GetRidesEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    const data = await firstValueFrom(observableData);

    return data;
  }

  async getRide(body: GetRideProps) {
    const observableData = this.usersClient
      .send('user.rideDetails', new GetRideEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    const data = await firstValueFrom(observableData);

    return data;
  }
}
