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
  constructor(@Inject('USERS') private readonly usersClient: ClientProxy) {}

  async geocode(data: GeocodeProps) {
    return this.usersClient
      .send('user.geocode', new GeocodeUserEvent(data))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }
  async reverseGeocode(data: ReverseGeocodeProps) {
    return this.usersClient
      .send('user.reverseGeocode', new ReverseGeocodeUserEvent(data))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }

  async getDirection(data: GetDirectionProps) {
    return this.usersClient
      .send('user.direction', new GetDirectionsUserEvent(data))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }

  async calculateDistance(data: CalculateDistanceProps) {
    return this.usersClient
      .send('user.calculateDistance', new CalculateDistanceUserEvent(data))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }
}
