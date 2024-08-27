import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpException,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { CustomException } from 'src/custom.exception';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @MessagePattern('driver.signup')
  async signup(@Payload() { data }: { data: SignupProps }) {
    try {
      return await this.authService.registerDriver(data);
    } catch (err) {
      if (err instanceof CustomException) {
        throw err;
      } else {
        console.log('error', err);
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @MessagePattern('driver.login')
  @UseInterceptors(ClassSerializerInterceptor)
  async login(@Payload() { data }: { data: LoginProps }) {
    try {
      return await this.authService.loginDriver(data);
    } catch (err) {
      if (err instanceof CustomException) {
        throw err;
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @MessagePattern('driver.verifyOtp')
  async verifyOtpCode(@Payload() { data }: { data: VerifyOtpCodeProps }) {
    try {
      return await this.authService.verifyOtpCode(data);
    } catch (err) {
      if (err instanceof CustomException) {
        throw err;
      } else {
        console.log('error', err);
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @MessagePattern('driver.resendOtp')
  async resendOtp(@Payload() { data }: { data: ResendOtpCodeProps }) {
    try {
      return await this.authService.resendOtpCode(data);
    } catch (err) {
      if (err instanceof CustomException) {
        throw err;
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
