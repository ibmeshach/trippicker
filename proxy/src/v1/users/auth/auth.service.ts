import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import {
  LoginUserEvent,
  ResendOtpEvent,
  SignupUserEvent,
  VerifyOtpEvent,
} from './auth.events';
import { catchError } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(@Inject('USERS') private readonly usersClient: ClientProxy) {}

  async login(body: LoginProps) {
    return this.usersClient.send('user.login', new LoginUserEvent(body)).pipe(
      catchError((error) => {
        throw error;
      }),
    );
  }

  async signup(body: SignupProps): Promise<any> {
    return this.usersClient.send('user.signup', new SignupUserEvent(body)).pipe(
      catchError((error) => {
        throw error;
      }),
    );
  }

  async verifyOtp(body: VerifyOtpCodeProps): Promise<any> {
    return this.usersClient
      .send('user.verifyOtp', new VerifyOtpEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }

  async resendOtp(body: ResendOtpCodeProps): Promise<any> {
    return this.usersClient
      .send('user.resendOtp', new ResendOtpEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }
}
