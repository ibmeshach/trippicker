import { Exclude } from 'class-transformer';
import { User } from 'src/entities/user.entity';

export class UserSerializer {
  @Exclude()
  otpToken: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
