import { Exclude } from 'class-transformer';
import { Driver } from 'typeorm';

export class DriverSerializer {
  @Exclude()
  otpToken: string;

  constructor(partial: Partial<Driver>) {
    Object.assign(this, partial);
  }
}
