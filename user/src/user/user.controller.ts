import {
  ClassSerializerInterceptor,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { CustomException } from 'src/custom.exception';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { UserEntity, UserProfileDetail } from './serializers/user.serializer';
import { plainToClass } from 'class-transformer';
import { RideService } from 'src/ride/ride.service';
import { DriverService } from 'src/driver/driver.service';
import { catchError, firstValueFrom } from 'rxjs';
import { RateUserEvent } from './user.events';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly rideService: RideService,
    private readonly driverService: DriverService,
    @Inject('DRIVERS') private readonly driverClient: ClientProxy,
  ) {}

  @MessagePattern('user.updateLocation')
  @UseInterceptors(ClassSerializerInterceptor)
  async updateLocation(
    @Payload() { data }: { data: LocationEventPayloadProps },
  ) {
    try {
      const secret = this.configService.get<string>('JWT_ACCESS_TOKEN');
      const payload = await this.userService.decodejwtToken(data.token, secret);

      if (!payload)
        throw new CustomException(
          'Invalid or expired jwt token',
          HttpStatus.BAD_REQUEST,
        );

      const userId = payload.sub;

      const userCurrentLocationData = {
        address: data.address,
        currentLatitude: data.currentLatitude,
        currentLongitude: data.currentLongitude,
      };

      await this.userService.updateUserLocation(
        userId,
        userCurrentLocationData,
      );

      // const drivers = await this.userService.getNearestDrivers({
      //   userLatitude: data.currentLatitude,
      //   userLongitude: data.currentLongitude,
      // });

      return userCurrentLocationData;
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

  @MessagePattern('user.userDetails')
  @UseInterceptors(ClassSerializerInterceptor)
  async getUserDetails(@Payload() { data }: { data: { id: string } }) {
    try {
      const user = await this.userService.findUserById(data.id);

      if (!user)
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);

      const responseUser = new UserEntity(user);

      return responseUser;
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

  @MessagePattern('user.rateUser')
  async rateUser(
    @Payload()
    { data }: { data: { rating: number; phoneNumber: string; rideId: string } },
  ) {
    try {
      const user = await this.userService.findUserByPhoneNumber(
        data.phoneNumber,
      );

      if (!user)
        throw new CustomException(
          'Enter a valid user phoneNumber',
          HttpStatus.NOT_FOUND,
        );

      const ride = await this.rideService.findRideByRideId(data.rideId);

      ride.userRating = data.rating;
      ride.save();

      const oldRating = user.rating;
      const averageRating = (oldRating + data.rating) / (user.noOfRating + 1);
      user.rating = averageRating;
      user.noOfRating += 1;
      await user.save();

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

  @MessagePattern('user.rateDriver')
  async rateDriver(
    @Payload()
    { data }: { data: { rating: number; userId: string; rideId: string } },
  ) {
    try {
      const user = await this.userService.findUserById(data.userId);

      if (!user)
        throw new CustomException('Enter a valid userId', HttpStatus.NOT_FOUND);

      const ride = await this.rideService.findRideByRideId(data.rideId);

      if (user.phoneNumber !== ride.userPhoneNumber)
        throw new CustomException(
          'Wrong user for rating this driver',
          HttpStatus.BAD_REQUEST,
        );

      ride.driverRating = data.rating;
      ride.save();

      const driver = await this.driverService.findDriverByPhoneNumber(
        ride.driverPhoneNumber,
      );

      const oldRating = driver.rating;
      const averageRating = (oldRating + data.rating) / (driver.noOfRating + 1);
      driver.rating = averageRating;
      driver.noOfRating += 1;
      await driver.save();

      const observableData = this.driverClient
        .send(
          'driver.rateDriver',
          new RateUserEvent({
            rating: data.rating,
            phoneNumber: ride.driverPhoneNumber,
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

  @MessagePattern('user.editProfile')
  async editProfile(@Payload() { data }: { data: EditUserProfile }) {
    try {
      let profileImage: string;

      if (data.file) {
        profileImage = data.file.path;
      }

      const userId = data.userId;
      delete data.phoneNumber;
      delete data.userId;
      delete data.file;
      await this.userService.update(userId, { ...data, profileImage });
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

  @MessagePattern('user.getProfileDetails')
  async getProfileDetails(@Payload() { data }: { data: { userId: string } }) {
    try {
      const user = await this.userService.findUserById(data.userId);
      return plainToClass(UserProfileDetail, user);
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
