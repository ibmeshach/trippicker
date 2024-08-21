// src/events/events.service.ts
import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class EventsService {
  private rideRequestedSubject = new Subject<RequestRideGatewayProps>();

  rideRequested$ = this.rideRequestedSubject.asObservable();

  emitRideRequested(payload: RequestRideGatewayProps) {
    this.rideRequestedSubject.next(payload);
  }
}
