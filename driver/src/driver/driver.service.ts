import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisConfigService } from 'src/config/redis.service';
import { CustomException } from 'src/custom.exception';
import { Driver } from 'src/entities/driver.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    private jwtService: JwtService,
    private redisService: RedisConfigService,
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
    maxDistance: number = 2000000,
  ): Promise<Driver[]> {
    try {
      const cacheKey = `nearest-drivers:${userLatitude}:${userLongitude}:${maxDistance}`;
      const cachedResult = await this.redisService.get(cacheKey);

      if (cachedResult) {
        return JSON.parse(cachedResult);
      }

      // Get all drivers (you might want to limit this query for performance reasons)

      const nearestDrivers = await this.driverRepository
        .createQueryBuilder('driver')
        .where('driver.isAvailable = :isAvailable', { isAvailable: true })
        .andWhere('driver.isOnline = :isOnline', { isOnline: true })
        .andWhere(
          `(
        6371 * acos(
          cos(radians(:latitude)) * cos(radians(driver.currentLatitude))
          * cos(radians(driver.currentLongitude) - radians(:longitude))
          + sin(radians(:latitude)) * sin(radians(driver.currentLatitude))
        )
      ) <= :maxDistance`,
          {
            latitude: userLatitude,
            longitude: userLongitude,
            maxDistance: maxDistance / 1000,
          }, // Convert maxDistance to kilometers
        )
        .limit(20) // Limit results for performance
        .getMany();

      await this.redisService.set(
        cacheKey,
        JSON.stringify(nearestDrivers),
        3600,
      ); // Cache for 1 hour
      return nearestDrivers;
    } catch (err) {
      console.log('error in the driver service', err);
    }
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

  async decodejwtToken(token: string, secret: string) {
    try {
      if (token) {
        const payload = await this.jwtService.verifyAsync(token, {
          secret,
        });
        return payload;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  }
}
