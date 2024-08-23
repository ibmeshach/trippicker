import { Exclude } from 'class-transformer';
import { Ride } from 'src/entities/rides.entity';
import { User } from 'src/entities/user.entity';

export class ChatMessageEntity {
  @Exclude()
  rideKey: string;

  @Exclude()
  ride: Ride;

  @Exclude()
  user: User;

  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<ChatMessageEntity>) {
    Object.assign(this, partial);
  }
}
