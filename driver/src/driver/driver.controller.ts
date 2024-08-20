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

@Controller('driver')
export class DriverController {
  constructor(
    private readonly driverService: DriverService,
    private readonly configService: ConfigService,
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
        .send('user.userDetails', new GetUserEvent(data.userId))
        .pipe(
          catchError((error) => {
            throw error;
          }),
        );

      const user = await firstValueFrom(userObservable);

      console.log(driver, 'driver');
      console.log(user, 'user');

      return { driver, user };
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
