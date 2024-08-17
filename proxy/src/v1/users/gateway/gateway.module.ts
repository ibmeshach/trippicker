import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS',
        transport: Transport.TCP,
        // options: {
        //   host: 'users-nestjs-backend.railway.internal',
        //   port: 3001,
        // },
      },
    ]),
  ],
  providers: [GatewayService],
})
export class UsersGatewayModule {}
