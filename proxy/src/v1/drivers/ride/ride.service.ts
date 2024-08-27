import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import {
  ArrivedTripEvent,
  ClosestDriverEvent,
  EndTripEvent,
  StartTripEvent,
} from './ride.events';
import { GatewayService } from 'src/v1/gateway/gateway.service';
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
  }

  async arrivedTrip(body: ArrivedTripProps) {
    const observableData = this.driversClient
      .send('driver.arrivedTrip', new ArrivedTripEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }

  async startTrip(body: StartTripProps) {
    const observableData = this.driversClient
      .send('driver.arrivedTrip', new StartTripEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }
}
