import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { LoginUserEvent, ResendOtpEvent, VerifyOtpEvent } from './auth.events';
import { catchError } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(@Inject('DRIVERS') private readonly usersClient: ClientProxy) {}

  async login(body: LoginProps) {
    return this.usersClient.send('driver.login', new LoginUserEvent(body)).pipe(
      catchError((error) => {
        throw error;
      }),
    );
  }

  async verifyOtp(body: VerifyOtpCodeProps): Promise<any> {
    return this.usersClient
      .send('driver.verifyOtp', new VerifyOtpEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }

  async resendOtp(body: ResendOtpCodeProps): Promise<any> {
    return this.usersClient
      .send('driver.resendOtp', new ResendOtpEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }
}
