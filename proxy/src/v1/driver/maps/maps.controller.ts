import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MapsService } from './maps.service';

@ApiTags('drivers-maps')
@Controller('v1/drivers/maps')
export class MapsController {
  constructor(private mapService: MapsService) {}

  @Get('geocode')
  @ApiOperation({ summary: 'Get geocode for an address' })
  @ApiResponse({
    status: 200,
    description: 'Geocode successful',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async geocode(@Query('address') address: string): Promise<any> {
    return await this.mapService.geocode({ address });
  }

  @Get('reverse-geocode')
  @ApiOperation({ summary: 'Get address from latitude and longitude' })
  @ApiResponse({
    status: 200,
    description: 'Reverse geocode successful',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async reverseGeocode(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
  ): Promise<any> {
    return await this.mapService.reverseGeocode({ lat, lng });
  }

  @Get('directions')
  @ApiOperation({ summary: 'Get directions between two locations' })
  @ApiResponse({
    status: 200,
    description: 'Directions fetched successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getDirection(
    @Query('originLat') originLat: number,
    @Query('originLng') originLng: number,
    @Query('destinationLat') destinationLat: number,
    @Query('destinationLng') destinationLng: number,
  ): Promise<any> {
    return await this.mapService.getDirection({
      origin: { lat: originLat, lng: originLng },
      destination: { lat: destinationLat, lng: destinationLng },
    });
  }

  @Get('calculate-distance')
  @ApiOperation({ summary: 'Calculate distance between multiple locations' })
  @ApiResponse({
    status: 200,
    description: 'Distance calculated successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async calculateDistance(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ): Promise<any> {
    const originCoords = origin.split(',').map((coord) => {
      const [lat, lng] = coord.split(':').map(Number);
      return { lat, lng };
    });

    const destinationCoords = destination.split(',').map((coord) => {
      const [lat, lng] = coord.split(':').map(Number);
      return { lat, lng };
    });

    return await this.mapService.calculateDistance({
      origin: originCoords,
      destination: destinationCoords,
    });
  }
}
