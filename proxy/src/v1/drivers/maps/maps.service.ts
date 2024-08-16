import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import {
  CalculateDistanceUserEvent,
  GeocodeUserEvent,
  GetDirectionsUserEvent,
  ReverseGeocodeUserEvent,
} from './maps.events';

@Injectable()
export class MapsService {
  constructor(@Inject('DRIVERS') private readonly usersClient: ClientProxy) {}

  async geocode(data: GeocodeProps) {
    return this.usersClient
      .send('driver.geocode', new GeocodeUserEvent(data))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }
  async reverseGeocode(data: ReverseGeocodeProps) {
    return this.usersClient
      .send('driver.reverseGeocode', new ReverseGeocodeUserEvent(data))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }

  async getDirection(data: GetDirectionProps) {
    return this.usersClient
      .send('driver.direction', new GetDirectionsUserEvent(data))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }

  async calculateDistance(data: CalculateDistanceProps) {
    return this.usersClient
      .send('driver.calculateDistance', new CalculateDistanceUserEvent(data))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }
}
