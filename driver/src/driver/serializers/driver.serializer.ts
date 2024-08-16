import { Exclude } from 'class-transformer';

export class DriverEntity {
  @Exclude()
  otpToken: string;

  constructor(partial: Partial<DriverEntity>) {
    Object.assign(this, partial);
  }
}
