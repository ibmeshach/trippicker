import { Module } from '@nestjs/common';
import { RideController } from './ride.controller';
import { RideService } from './ride.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GatewayService } from 'src/v1/drivers/gateway/gateway.service';
import { MapsService } from 'src/v1/maps/maps.service';

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
          // host: 'users-nestjs-backend.railway.internal',
          port: 3002,
        },
      },
    ]),
  ],
  controllers: [RideController],
  providers: [RideService, GatewayService, MapsService],
})
export class UserRideModule {}
