import {
  ClassSerializerInterceptor,
  Controller,
  HttpException,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { ConfigService } from '@nestjs/config';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomException } from 'src/custom.exception';

@Controller('driver')
export class DriverController {
  constructor(
    private readonly driverService: DriverService,
    private readonly configService: ConfigService,
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
    @Payload() { data }: { data: getNearestDriverProps },
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
}
