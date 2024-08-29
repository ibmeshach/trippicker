import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { RideService } from './ride.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CancelRideDto, RequestRideDto } from './ride.dto';
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
    @Req() req: Request
  ): Promise<any> {
    const userId = req['user'].sub;

    await this.rideService.requestRide({
      id: userId,
      cost: body.cost,
      range: body.range,
      duration: body.duration,
      origin: body.origin,
      destination: body.destination,
      originAddress: body.originAddress,
      destinationAddresses: body.destinationAddresses,
      driverId: '',
    });

    return 'success';
  }

  @Post('cancel-ride')
  @ApiResponse({
    status: 201,
    description: 'cancel ride',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({
    type: CancelRideDto,
    description: 'Json structure for cancel a ride',
  })
  async cancelRide(
    @Body() body: CancelRideDto,
    @Req() req: Request
  ): Promise<any> {
    const userId = req['user'].sub;

    console.log('userId', userId);
    await this.rideService.cancelRide({
      userId,
      ...body,
    });

    return 'Success';
  }

  @Get('all')
  @ApiResponse({
    status: 200,
    description: 'Fetched rides',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getRides(@Req() req: Request): Promise<any> {
    const userId = req['user'].sub;

    const res = await this.rideService.getRides({
      userId,
    });

    return res;
  }

  @Get(':rideId')
  @ApiResponse({
    status: 200,
    description: 'Fetched rides',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getRide(
    @Req() req: Request,
    @Query('rideId') rideId: string
  ): Promise<any> {
    const userId = req['user'].sub;

    const res = await this.rideService.getRide({
      userId,
      rideId,
    });

    return res;
  }
}
