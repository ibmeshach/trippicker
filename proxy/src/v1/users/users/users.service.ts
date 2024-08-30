import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { EditProfileEvent, GetProfileEvent } from './users.events';

@Injectable()
export class UsersService {
  constructor(@Inject('USERS') private readonly usersClient: ClientProxy) {}
  async editProfile(payload: any) {
    const observableData = this.usersClient
      .send('user.editProfile', new EditProfileEvent(payload))
      .pipe(
        catchError(error => {
          throw error;
        })
      );

    await firstValueFrom(observableData);
  }

  async getProfileDetails(userId: string) {
    const observableData = this.usersClient
      .send('user.getProfileDetails', new GetProfileEvent({ userId }))
      .pipe(
        catchError(error => {
          throw error;
        })
      );

    const userProfileDetails = await firstValueFrom(observableData);
    return userProfileDetails;
  }
}
