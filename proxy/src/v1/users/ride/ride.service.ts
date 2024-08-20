import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { ClosestDriverEvent } from './ride.events';
import { GatewayService } from 'src/v1/drivers/gateway/gateway.service';

@Injectable()
export class RideService {
  constructor(
    @Inject('USERS') private readonly usersClient: ClientProxy,
    @Inject('DRIVERS') private readonly driversClient: ClientProxy,
    private readonly gatewayService: GatewayService,
  ) {}

  async requestRide(body: RideRequestProps) {
    const observableData = this.driversClient
      .send(
        'driver.closestDriver',
        new ClosestDriverEvent({
          userId: body.id,
          origin: body.origin,
          driverId: body.driverId,
        }),
      )
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    const { user, driver } = await firstValueFrom(observableData);

    return this.gatewayService.requestRide({
      cost: body.cost,
      range: body.range,
      duration: body.duration,
      origin: body.origin,
      destination: body.destination,
      driver: driver,
      user: user,
    });
  }
}
