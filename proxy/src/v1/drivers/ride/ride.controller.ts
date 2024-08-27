import { Body, Controller, Post, Req } from '@nestjs/common';
import { RideService } from './ride.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ArrivedTripDto, EndTripDto, RequestRideDto } from './ride.dto';
import { Request } from 'express';

@ApiTags('ride')
@Controller('v1/drivers/ride')
export class RideController {
  constructor(private readonly rideService: RideService) {}

  @Post('end-trip')
  @ApiResponse({
    status: 201,
    description: 'ended trip',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({
    type: EndTripDto,
    description: 'Json structure for ending a trip',
  })
  async endTrip(@Body() body: EndTripDto, @Req() req: Request): Promise<any> {
    const userId = req['user'].sub;

    await this.rideService.endTrip({
      userId,
      ...body,
    });

    return 'Success';
  }

  @Post('arrived-trip')
  @ApiResponse({
    status: 201,
    description: 'trip arrived successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({
    type: RequestRideDto,
    description: 'Json structure for arriving a trip',
  })
  async arriveTrip(
    @Body() body: ArrivedTripDto,
    @Req() req: Request,
  ): Promise<any> {
    const userId = req['user'].sub;

    await this.rideService.arrivedTrip({
      userId,
      ...body,
    });

    return 'Success';
  }

  @Post('start-trip')
  @ApiResponse({
    status: 201,
    description: 'trip started successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({
    type: RequestRideDto,
    description: 'Json structure for starting a trip',
  })
  async startTrip(
    @Body() body: StartTripProps,
    @Req() req: Request,
  ): Promise<any> {
    const userId = req['user'].sub;

    await this.rideService.startTrip({
      userId,
      ...body,
    });

    return 'Success';
  }
}
