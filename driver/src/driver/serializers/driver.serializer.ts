import { Exclude, Expose } from 'class-transformer';

export class DriverEntity {
  @Exclude()
  otpToken: string;

  constructor(partial: Partial<DriverEntity>) {
    Object.assign(this, partial);
  }
}

export class DriverProfileDetail {
  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  address: string;

  @Expose()
  profileImage: string;

  constructor(partial: Partial<DriverProfileDetail>) {
    Object.assign(this, partial);
  }
}
