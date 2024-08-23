import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ride } from 'src/entities/rides.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RideService {
  constructor(
    @InjectRepository(Ride)
    private rideRepository: Repository<Ride>,
  ) {}

  async findRideByRideId(rideId: string): Promise<Ride> {
    const ride = await this.rideRepository.findOneBy({ rideId });
    return ride;
  }

  create(createRideData: Partial<Ride>) {
    const driver = this.rideRepository.create(createRideData);
    return driver;
  }
}
