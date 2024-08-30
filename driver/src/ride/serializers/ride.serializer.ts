import { Type } from 'class-transformer';
import { Ride } from 'src/entities/rides.entity';
import { UserSerializer } from './user.serializer';

export class RideSerializer {
  @Type(() => UserSerializer)
  user: UserSerializer;

  constructor(partial: Partial<Ride>) {
    Object.assign(this, partial);
  }
}
