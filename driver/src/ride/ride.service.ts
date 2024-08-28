import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ride } from 'src/entities/rides.entity';
import { In, Repository } from 'typeorm';

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

  async findActiveRideById(rideId: string): Promise<Ride> {
    const ride = await this.rideRepository.findOneBy({
      rideId,
      status: In(['booked', 'arrived', 'started']),
    });

    return ride;
  }

  async updateRide(rideId: string, updateOptions: Partial<Ride>) {
    await this.rideRepository.update(
      {
        rideId,
      },
      updateOptions,
    );
  }

  async updateRideAndReturn(
    rideId: string,
    updateOptions: Partial<Ride>,
  ): Promise<Ride> {
    await this.rideRepository.update(
      {
        rideId,
      },
      updateOptions,
    );

    return await this.rideRepository.findOneBy({ rideId });
  }

  async updateRideStatus(
    rideId: string,
    driverPhoneNumber: string,
    updateOptions: Partial<Ride>,
  ) {
    await this.rideRepository.update(
      {
        rideId,
        driverPhoneNumber,
      },
      updateOptions,
    );
  }

  async updateRideStatusAndReturn(
    rideId: string,
    driverPhoneNumber: string,
    updateOptions: Partial<Ride>,
  ) {
    await this.rideRepository.update(
      {
        rideId,
        driverPhoneNumber,
      },
      updateOptions,
    );

    return await this.rideRepository.findOneBy({ rideId });
  }

  create(createRideData: Partial<Ride>) {
    const driver = this.rideRepository.create(createRideData);
    return driver;
  }
}
