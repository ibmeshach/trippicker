import { Controller, HttpException, HttpStatus } from '@nestjs/common';
import { MapService } from './map.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomException } from 'src/custom.exception';

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

  @MessagePattern('user.geocode')
  async reversegeocode(@Payload() { data }: { data: ReverseGeoCodeProps }) {
    try {
      return await this.mapService.reservegeocodeAddress(data);
    } catch (err) {
      if (err instanceof DOMException) {
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
  async direction(@Payload() { data }: { data: DirectionProps }) {
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
}
