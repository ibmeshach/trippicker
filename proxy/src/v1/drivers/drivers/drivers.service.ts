import { Inject, Injectable } from '@nestjs/common';
import { EditProfileEvent, GetProfileEvent } from './drivers.events';
import { catchError, firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class DriversService {
  constructor(@Inject('DRIVERS') private readonly driversClient: ClientProxy) {}
  async editProfile(payload: EditDriverProfile) {
    const observableData = this.driversClient
      .send('driver.editProfile', new EditProfileEvent(payload))
      .pipe(
        catchError(error => {
          throw error;
        })
      );

    await firstValueFrom(observableData);
  }

  async getProfileDetails(userId: string) {
    const observableData = this.driversClient
      .send('driver.getProfileDetails', new GetProfileEvent({ userId }))
      .pipe(
        catchError(error => {
          throw error;
        })
      );

    const userProfileDetails = await firstValueFrom(observableData);
    return userProfileDetails;
  }
}
