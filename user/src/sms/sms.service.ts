import { Injectable } from '@nestjs/common';
import { TwilioService } from 'nestjs-twilio';

@Injectable()
export class SmsService {
  // public constructor(private readonly twilioService: TwilioService) {}

  generateOTP(length: number) {
    const characters = '0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }

    return code;
  }

  // async sendSMS(phoneNumber: string) {
  //   return this.twilioService.client.messages.create({
  //     body: 'SMS Body, sent to the phone!',
  //     from: '',
  //     to: phoneNumber,
  //   });
  // }
}
