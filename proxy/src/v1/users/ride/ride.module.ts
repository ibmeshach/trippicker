import { Module } from '@nestjs/common';
import { RideController } from './ride.controller';
import { RideService } from './ride.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DriversGatewayService } from 'src/v1/drivers/gateway/gateway.service';
import { MapsService } from 'src/v1/maps/maps.service';
import { UsersGatewayService } from '../gateway/gateway.service';
import { DriversGatewayModule } from 'src/v1/drivers/gateway/gateway.module';
import { UsersGatewayModule } from '../gateway/gateway.module';

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
    DriversGatewayModule,
    UsersGatewayModule,
  ],
  controllers: [RideController],
  providers: [
    RideService,
    MapsService,
    DriversGatewayService,
    UsersGatewayService,
  ],

  exports: [RideService],
})
export class UserRideModule {}
