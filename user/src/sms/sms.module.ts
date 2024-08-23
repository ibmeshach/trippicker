import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { TwilioModule, TwilioService } from 'nestjs-twilio';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  providers: [SmsService],
})
export class SmsModule {}
