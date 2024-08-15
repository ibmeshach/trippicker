import { Exclude } from 'class-transformer';

export class UserEntity {
  @Exclude()
  otpToken: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
