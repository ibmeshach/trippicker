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
import { RideService } from 'src/ride/ride.service';

@Controller('driver')
export class DriverController {
  constructor(
    private readonly driverService: DriverService,
    private readonly configService: ConfigService,
    private readonly rideService: RideService,
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

      console.log(driverCurrentLocationData);

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
    console.log(data);
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
    try {
      if (!data.action)
        throw new CustomException(
          'Driver has not accepted the ride',
          HttpStatus.BAD_REQUEST,
        );

      const createRideData = {
        ...data,
        duration: data.duration.toString(),
        distance: data.range,
      };
      const ride = this.rideService.create(createRideData);

      ride.save();
      return ride;
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
