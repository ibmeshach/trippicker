import { Type } from 'class-transformer';
import { Ride } from 'src/entities/rides.entity';
import { DriverSerializer } from './driver.serializer';

export class RideSerializer {
  @Type(() => DriverSerializer)
  driver: DriverSerializer;

  constructor(partial: Partial<Ride>) {
    Object.assign(this, partial);
  }
}
