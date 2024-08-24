import {
  ClassSerializerInterceptor,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  UseInterceptors,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { CustomException } from 'src/custom.exception';
import { GetUserEvent } from './driver.events';
import { catchError, firstValueFrom } from 'rxjs';
import { DriverEntity } from './serializers/driver.serializer';
import { UserService } from 'src/user/user.service';
import { DataSource, QueryRunner } from 'typeorm';

import { User } from 'src/entities/user.entity';
import { Ride } from 'src/entities/rides.entity';
import { RideService } from 'src/ride/ride.service';

@Controller('driver')
export class DriverController {
  private queryRunner: QueryRunner;

  constructor(
    private dataSource: DataSource,
    private readonly driverService: DriverService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly rideService: RideService,
    @Inject('USERS') private readonly usersClient: ClientProxy,
  ) {
    this.queryRunner = this.dataSource.createQueryRunner();
  }

  @MessagePattern('driver.updateLocation')
  @UseInterceptors(ClassSerializerInterceptor)
  async updateLocation(
    @Payload() { data }: { data: LocationEventPayloadProps },
  ) {
    try {
      const secret = this.configService.get<string>('JWT_ACCESS_TOKEN');
      const payload = await this.driverService.decodejwtToken(
        data.token,
        secret,
      );

      if (!payload)
        throw new CustomException(
          'Invalid or expired jwt token',
          HttpStatus.BAD_REQUEST,
        );

      const driverId = payload.sub;

      const driverCurrentLocationData = {
        address: data.address,
        currentLatitude: data.currentLatitude,
        currentLongitude: data.currentLongitude,
      };

      await this.driverService.updateDriverLocation(
        driverId,
        driverCurrentLocationData,
      );

      return driverCurrentLocationData;
    } catch (err) {
      console.log(err);
      if (err instanceof CustomException) {
        throw err;
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @MessagePattern('driver.getNearestDrivers')
  async getNearestDrivers(
    @Payload() { data }: { data: GetNearestDriverProps },
  ) {
    try {
      const drivers = await this.driverService.findNearestDrivers(
        data.userLatitude,
        data.userLongitude,
        data.maxDistance,
      );

      return drivers;
    } catch (err) {
      if (err instanceof CustomException) {
        throw err;
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @MessagePattern('driver.closestDriver')
  async requestRide(@Payload() { data }: { data: GetClosestDriverProps }) {
    try {
      const driver = await this.driverService.findClosestDriver(
        data.origin.lat,
        data.origin.lng,
      );

      const userObservable = this.usersClient
        .send('user.userDetails', new GetUserEvent({ id: data.userId }))
        .pipe(
          catchError((error) => {
            throw error;
          }),
        );

      const user = await firstValueFrom(userObservable);

      const responseDriver = new DriverEntity(driver);

      return { driver: responseDriver, user };
    } catch (err) {
      console.log(err);
      if (err instanceof CustomException) {
        throw err;
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @MessagePattern('driver.acceptedRide')
  async acceptedRide(@Payload() { data }: { data: DriverRideResponseProps }) {
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();

    console.log('data', data);
    try {
      if (!data.action)
        throw new CustomException(
          'Driver has not accepted the ride',
          HttpStatus.BAD_REQUEST,
        );

      let user = await this.userService.findUserByPhoneNumberLock(
        data.user.phoneNumber,
        this.queryRunner.manager,
      );

      delete data.user.id;
      if (!user) {
        // Create a new user if it does not exist
        user = this.queryRunner.manager.create(User, data.user);
        await this.queryRunner.manager.save(user);
      } else {
        // Update the existing user if needed
        await this.queryRunner.manager.update(
          User,
          { phoneNumber: data.user.phoneNumber },
          data.user,
        );
      }

      const driver = await this.driverService.findDriverById(data.driver.id);

      const createRideData = {
        ...data,
        duration: data.duration.toString(),
        distance: data.range,
        user: user,
        driver: driver,
      };

      const ride = this.queryRunner.manager.create(Ride, createRideData);
      await this.queryRunner.manager.save(ride);
      await this.queryRunner.manager.save(user);

      await this.queryRunner.commitTransaction();
      return ride;
    } catch (err) {
      await this.queryRunner.rollbackTransaction();
      console.log(err);
      if (err instanceof CustomException) {
        throw err;
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @MessagePattern('driver.getCurrentLocation')
  @UseInterceptors(ClassSerializerInterceptor)
  async getCurrentLocation(@Payload() { data }: { data: { rideId: string } }) {
    try {
      const ride: Ride = await this.rideService.findRideByRideId(data.rideId);

      const driver = new DriverEntity(ride.driver);

      return driver;
    } catch (err) {
      if (err instanceof CustomException) {
        throw err;
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
