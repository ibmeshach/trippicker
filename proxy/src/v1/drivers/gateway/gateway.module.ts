import { Module } from '@nestjs/common';
import { DriversGatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MapsService } from 'src/v1/maps/maps.service';
import { RideService } from 'src/v1/users/ride/ride.service';
import { UsersGatewayService } from 'src/v1/users/gateway/gateway.service';
import { UserRideModule } from 'src/v1/users/ride/ride.module';

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
  providers: [
    DriversGatewayService,
    MapsService,
    UsersGatewayService,
    RideService,
  ],
  exports: [DriversGatewayService],
})
export class DriversGatewayModule {}
