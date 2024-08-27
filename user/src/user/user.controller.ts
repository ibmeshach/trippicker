import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomException } from 'src/custom.exception';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from './serializers/user.serializer';
import { RideService } from 'src/ride/ride.service';
import { DataSource, QueryRunner } from 'typeorm';
import { Driver } from 'src/entities/driver.entity';
import { Ride } from 'src/entities/rides.entity';
import { ChatsService } from 'src/chats/chats.service';
import { DriverService } from 'src/driver/driver.service';

@Controller('user')
export class UserController {
  private queryRunner: QueryRunner;

  constructor(
    private dataSource: DataSource,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly driverService: DriverService,
  ) {
    this.queryRunner = this.dataSource.createQueryRunner();
  }

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

  @MessagePattern('user.acceptedRide')
  async acceptedRide(@Payload() { data }: { data: UserRideResponseProps }) {
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
    try {
      if (!data.action)
        throw new CustomException(
          'Driver has not accepted the ride',
          HttpStatus.BAD_REQUEST,
        );

      let driver = await this.queryRunner.manager.findOne(Driver, {
        where: { phoneNumber: data.driver.phoneNumber },
      });

      delete data.driver.id;
      if (!driver) {
        // Create a new driver if it does not exist
        driver = this.queryRunner.manager.create(Driver, data.driver);
        await this.queryRunner.manager.save(driver);
      } else {
        // Update the existing driver if needed
        await this.queryRunner.manager.update(
          Driver,
          { phoneNumber: data.user.phoneNumber },
          data.driver,
        );
      }

      const user = await this.userService.findUserById(data.user.id);

      const createRideData = {
        ...data,
        userPhoneNumber: user.phoneNumber,
        driverPhoneNumber: driver.phoneNumber,
        duration: data.duration.toString(),
        distance: data.range,
      };

      const ride = this.queryRunner.manager.create(Ride, createRideData);
      await this.queryRunner.manager.save(ride);
      await this.queryRunner.manager.save(driver);

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

  @MessagePattern('user.rateUser')
  async getAllChatMessages(
    @Payload() { data }: { data: { rating: number; userId: string } },
  ) {
    try {
      const user = await this.userService.findUserById(data.userId);

      if (!user)
        throw new CustomException('Enter a valid userId', HttpStatus.NOT_FOUND);

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

  @MessagePattern('user.editProfile')
  async editProfile(@Payload() { data }: { data: EditUserProfile }) {
    try {
      await this.userService.update(data.userId, data);

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
}
