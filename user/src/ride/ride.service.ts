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

  async updateRideStatus(
    rideId: string,
    userPhoneNumber: string,
    updateOptions: Partial<Ride>,
  ) {
    await this.rideRepository.update(
      {
        rideId,
        userPhoneNumber,
      },
      updateOptions,
    );
  }

  async getRideHistories(userPhoneNumber: string): Promise<Ride[]> {
    return await this.rideRepository.find({
      where: {
        userPhoneNumber,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getRideDetails(rideId: string) {
    return await this.rideRepository.findOne({
      where: {
        id: rideId,
      },
      relations: ['driver'],
    });
  }

  create(createRideData: Partial<Ride>) {
    const driver = this.rideRepository.create(createRideData);
    return driver;
  }
}
