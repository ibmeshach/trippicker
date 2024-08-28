import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  private sendSmsUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.sendSmsUrl = `${this.configService.get<string>('TERMII_BASE_URL')}/api/sms/send`;
  }

  generateOTP(length: number): string {
    const characters = '0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }

    return code;
  }

  async sendOtp(phoneNumber: string): Promise<any> {
    try {
      // Remove the first zero if it exists
      const formattedPhoneNumber = phoneNumber.startsWith('0')
        ? phoneNumber.slice(1)
        : phoneNumber;

      const otpCode = this.generateOTP(4);
      const response = await firstValueFrom(
        this.httpService
          .post(this.sendSmsUrl, {
            api_key: this.configService.get<string>('TERMII_API_KEY'),
            to: `234${formattedPhoneNumber}`,
            from: 'Trippicker',
            sms: `Your trippicker pin is-${otpCode}. It expires in 1min.`,
            type: 'plain',
            channel: 'generic',
          })
          .pipe(
            map((response) => response.data),
            catchError((error) => {
              console.error(error);
              throw new HttpException(
                'Failed to send OTP',
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }),
          ),
      );

      console.log({ res: response });
      return otpCode;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to send OTP',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
