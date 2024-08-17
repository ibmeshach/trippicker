import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomException } from 'src/custom.exception';
import { Driver } from 'src/entities/driver.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) {}

  async findDriverByPhoneNumberLock(
    phoneNumber: string,
    manager: EntityManager,
  ): Promise<Driver | undefined> {
    const driver = manager
      .getRepository(Driver)
      .createQueryBuilder('driver')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber })
      .setLock('pessimistic_write')
      .getOne();

    if (driver) return driver;

    return undefined;
  }

  async findDriverByPhoneNumber(
    phoneNumber: string,
  ): Promise<Driver | undefined> {
    const driver = await this.driverRepository.findOne({
      where: { phoneNumber },
    });

    if (driver) return driver;

    return undefined;
  }

  async findDriverById(driverId: string): Promise<Driver | undefined> {
    const driver = await this.driverRepository.findOneBy({ id: driverId });

    if (driver) return driver;
    return undefined;
  }

  async findDriverByOptions(driverOptions: findDriversOptions) {
    const drivers = await this.driverRepository.find({
      where: driverOptions,
    });

    return drivers;
  }

  create(createDriverData: SignupProps) {
    const driver = this.driverRepository.create(createDriverData);
    return driver;
  }

  async updateOtpToken(updateOptions: {
    phoneNumber: string;
    otpToken: string;
  }): Promise<Driver> {
    const { phoneNumber, otpToken } = updateOptions;
    const user = await this.driverRepository.findOne({
      where: { phoneNumber },
    });
    if (!user) {
      throw new CustomException(
        `User with phone number ${phoneNumber} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    user.otpToken = otpToken;
    await this.driverRepository.save(user);
    return user;
  }

  async update(userId: string, updateOptions: Partial<Driver>) {
    return await this.driverRepository.update(
      {
        id: userId,
      },
      updateOptions,
    );
  }

  async updateDriverLocation(
    userId: string,
    storeOptions: updateLocationOptions,
  ) {
    return await this.update(userId, storeOptions);
  }

  async findNearestDrivers(
    userLatitude: number,
    userLongitude: number,
    maxDistance: number = 10000,
  ): Promise<Driver[]> {
    // const cacheKey = `nearest-drivers:${userLatitude}:${userLongitude}:${maxDistance}`;
    // const cachedResult = await this.redis.get(cacheKey);
    // if (cachedResult) {
    //   return JSON.parse(cachedResult);
    // }

    // Get all drivers (you might want to limit this query for performance reasons)
    const drivers = await this.findDriverByOptions({
      isAvailable: true,
      isOnline: true,
    });

    console.log('all drivers', drivers);

    // Filter drivers by calculating the distance between the user and driver
    const nearestDrivers = drivers.filter((driver) => {
      if (driver.currentLatitude && driver.currentLongitude) {
        const distance = this.getHaversineDistance(
          { latitude: userLatitude, longitude: userLongitude },
          {
            latitude: driver.currentLatitude,
            longitude: driver.currentLongitude,
          },
        );

        console.log('distance', distance);
        return distance <= maxDistance;
      }
    });

    // await this.redis.set(cacheKey, JSON.stringify(drivers), 'EX', 3600); // Cache for 1 hour
    return nearestDrivers;
  }

  getHaversineDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number },
  ): number {
    const R = 6371e3; // Radius of the Earth in meters
    const lat1 = this.degToRad(point1.latitude);
    const lat2 = this.degToRad(point2.latitude);
    const deltaLat = this.degToRad(point2.latitude - point1.latitude);
    const deltaLon = this.degToRad(point2.longitude - point1.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    return distance;
  }

  // Convert degrees to radians
  degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
