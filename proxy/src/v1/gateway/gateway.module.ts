import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MapsService } from 'src/v1/maps/maps.service';
import { RideService } from '../users/ride/ride.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS',
        transport: Transport.TCP,
        options: {
          host: 'users-nestjs-backend.railway.internal',
          port: 3001,
        },
      },
      {
        name: 'DRIVERS',
        transport: Transport.TCP,
        options: {
          host: 'drivers-nestjs-backend.railway.internal',
          port: 3002,
        },
      },
    ]),
    EventsModule,
  ],
  providers: [GatewayService, MapsService, RideService],
})
export class GatewayModule {}
