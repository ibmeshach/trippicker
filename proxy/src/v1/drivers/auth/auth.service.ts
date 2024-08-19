import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { LoginUserEvent, ResendOtpEvent, VerifyOtpEvent } from './auth.events';
import { catchError } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(@Inject('DRIVERS') private readonly driverClient: ClientProxy) {}

  async login(body: LoginProps) {
    return this.driverClient
      .send('driver.login', new LoginUserEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }

  async verifyOtp(body: VerifyOtpCodeProps): Promise<any> {
    return this.driverClient
      .send('driver.verifyOtp', new VerifyOtpEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }

  async resendOtp(body: ResendOtpCodeProps): Promise<any> {
    return this.driverClient
      .send('driver.resendOtp', new ResendOtpEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }
}
