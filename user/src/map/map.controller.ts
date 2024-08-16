import { Controller, HttpException, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomException } from 'src/custom.exception';
import { MapService } from './map.service';

@Controller()
export class MapController {
  constructor(private readonly mapService: MapService) {}
  @MessagePattern('user.geocode')
  async geocode(@Payload() { data }: { data: GeoCodeProps }) {
    try {
      return await this.mapService.geocodeAddress(data.address);
    } catch (err) {
      if (err instanceof CustomException) {
        throw err;
      } else {
        console.log('error', err);
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @MessagePattern('user.reverseGeocode')
  async reversegeocode(@Payload() { data }: { data: ReverseGeoCodeProps }) {
    try {
      return await this.mapService.reservegeocodeAddress(data);
    } catch (err) {
      if (err instanceof CustomException) {
        throw err;
      } else {
        console.log('error', err);
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @MessagePattern('user.direction')
  async getDirection(@Payload() { data }: { data: DirectionProps }) {
    try {
      return await this.mapService.getDirections(data.origin, data.destination);
    } catch (err) {
      if (err instanceof CustomException) {
        throw err;
      } else {
        console.log('error', err);
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @MessagePattern('user.calculateDistance')
  async calculateDistance(
    @Payload() { data }: { data: calculateDistanceProps },
  ) {
    try {
      return await this.mapService.calculateDistance(
        data.origins,
        data.distinations,
      );
    } catch (err) {
      if (err instanceof CustomException) {
        throw err;
      } else {
        console.log('error', err);
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
