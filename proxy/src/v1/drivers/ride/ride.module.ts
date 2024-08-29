import { Module } from '@nestjs/common';
import { RideController } from './ride.controller';
import { RideService } from './ride.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MapsService } from 'src/v1/maps/maps.service';
import { EventsModule } from 'src/v1/events/events.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS',
        transport: Transport.TCP,
        options: {
          // host: 'users-nestjs-backend.railway.internal',
          port: 3001,
        },
      },
      {
        name: 'DRIVERS',
        transport: Transport.TCP,
        options: {
          // host: 'drivers-nestjs-backend.railway.internal',
          port: 3002,
        },
      },
    ]),
    EventsModule,
  ],
  controllers: [RideController],
  providers: [RideService, MapsService],
})
export class DriverRideModule {}
