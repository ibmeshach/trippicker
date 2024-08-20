import { Module } from '@nestjs/common';
import { UsersGatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
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
  providers: [UsersGatewayService, MapsService],
  exports: [UsersGatewayService],
})
export class UsersGatewayModule {}
