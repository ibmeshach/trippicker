import { Body, Controller, Post, Req } from '@nestjs/common';
import { RideService } from './ride.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestRideDto } from './ride.dto';
import { Request } from 'express';

@ApiTags('ride')
@Controller('v1/users/ride')
export class RideController {
  constructor(private readonly rideService: RideService) {}

  @Post('request-ride')
  @ApiResponse({
    status: 201,
    description: 'Fetching driver',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({
    type: RequestRideDto,
    description: 'Json structure for requesting a ride',
  })
  async requestRide(
    @Body() body: RequestRideDto,
    @Req() req: Request,
  ): Promise<any> {
    const userId = req['user'].sub;

    return await this.rideService.requestRide({
      id: userId,
      cost: body.cost,
      range: body.range,
      duration: body.duration,
      origin: body.origin,
      destination: body.destination,
    });
  }
}
