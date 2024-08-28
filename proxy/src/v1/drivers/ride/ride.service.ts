import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import {
  ArrivedTripEvent,
  EndTripEvent,
  GetRideEvent,
  GetRidesEvent,
  StartTripEvent,
} from './ride.events';
import { EventsService } from 'src/v1/events/events.service';

@Injectable()
export class RideService {
  constructor(
    @Inject('DRIVERS') private readonly driversClient: ClientProxy,
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
  ) {}

  async endTrip(body: EndTripProps) {
    const observableData = this.driversClient
      .send('driver.endTrip', new EndTripEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    await firstValueFrom(observableData);
  }

  async arrivedTrip(body: ArrivedTripProps) {
    const observableData = this.driversClient
      .send('driver.arrivedTrip', new ArrivedTripEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    await firstValueFrom(observableData);
  }

  async startTrip(body: StartTripProps) {
    const observableData = this.driversClient
      .send('driver.startTrip', new StartTripEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    await firstValueFrom(observableData);
  }

  async getRides(body: GetRidesProps) {
    const observableData = this.driversClient
      .send('driver.rideHistories', new GetRidesEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    const data = await firstValueFrom(observableData);

    return data;
  }

  async getRide(body: GetRideProps) {
    const observableData = this.driversClient
      .send('driver.rideDetails', new GetRideEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    const data = await firstValueFrom(observableData);

    return data;
  }
}
