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
import {
  DriverEntity,
  DriverProfileDetail,
} from './serializers/driver.serializer';
import { plainToClass } from 'class-transformer';
import { RideService } from 'src/ride/ride.service';
import { UserService } from 'src/user/user.service';
import { RateUserEvent } from './drivers.event';

@Controller('driver')
export class DriverController {
  constructor(
    private readonly driverService: DriverService,
    private readonly configService: ConfigService,
    private readonly rideService: RideService,
    private readonly userService: UserService,
    @Inject('USERS') private readonly usersClient: ClientProxy,
  ) {}

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

  @MessagePattern('driver.rateDriver')
  async rateDriver(
    @Payload()
    { data }: { data: { rating: number; phoneNumber: string; rideId: string } },
  ) {
    try {
      const driver = await this.driverService.findDriverByPhoneNumber(
        data.phoneNumber,
      );

      if (!driver)
        throw new CustomException(
          'Enter a valid driverId',
          HttpStatus.NOT_FOUND,
        );

      const ride = await this.rideService.findRideByRideId(data.rideId);

      ride.driverRating = data.rating;
      ride.save();

      const oldRating = driver.rating;
      const averageRating = (oldRating + data.rating) / (driver.noOfRating + 1);
      driver.rating = averageRating;
      driver.noOfRating += 1;
      await driver.save();

      return { status: true };
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

  @MessagePattern('driver.rateUser')
  async rateUser(
    @Payload()
    { data }: { data: { rating: number; driverId: string; rideId: string } },
  ) {
    try {
      const driver = await this.driverService.findDriverById(data.driverId);

      if (!driver)
        throw new CustomException(
          'Enter a valid driverId',
          HttpStatus.NOT_FOUND,
        );

      const ride = await this.rideService.findRideByRideId(data.rideId);

      if (driver.phoneNumber !== ride.driverPhoneNumber)
        throw new CustomException(
          'Wrong driver for rating this user',
          HttpStatus.BAD_REQUEST,
        );

      ride.userRating = data.rating;
      ride.save();

      const user = await this.userService.findUserByPhoneNumber(
        ride.userPhoneNumber,
      );

      const oldRating = user.rating;
      const averageRating = (oldRating + data.rating) / (user.noOfRating + 1);
      user.rating = averageRating;
      user.noOfRating += 1;
      await user.save();

      const observableData = this.usersClient
        .send(
          'user.rateUser',
          new RateUserEvent({
            rating: data.rating,
            phoneNumber: ride.userPhoneNumber,
            rideId: data.rideId,
          }),
        )
        .pipe(
          catchError((error) => {
            throw error;
          }),
        );

      await firstValueFrom(observableData);

      return { status: true };
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

  @MessagePattern('driver.editProfile')
  async editProfile(@Payload() { data }: { data: EditDriverProfile }) {
    try {
      let profileImage: string;

      if (data.file) {
        profileImage = data.file.path;
      }

      const userId = data.driverId;
      delete data.phoneNumber;
      delete data.driverId;
      delete data.file;
      await this.driverService.update(userId, { ...data, profileImage });
      return { status: true };
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

  @MessagePattern('driver.getProfileDetails')
  async getProfileDetails(@Payload() { data }: { data: { driverId: string } }) {
    try {
      const user = await this.driverService.findDriverById(data.driverId);
      return plainToClass(DriverProfileDetail, user);
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
}
