import { Injectable } from '@nestjs/common';
import { TwilioService } from 'nestjs-twilio';

@Injectable()
export class AppService {
  public constructor(private readonly twilioService: TwilioService) {}

  getStatus(): string {
    return 'Ping from server!';
  }

  async sendSMS(phoneNumber: string) {
    const res = await this.twilioService.client.messages.create({
      body: 'SMS Body, sent to the phone!',
      from: '+19283251809',
      to: '+2347011054791',
    });

    console.log(res);
    return res;
  }
}
