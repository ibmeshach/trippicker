import { Module } from '@nestjs/common';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
    ]),
  ],
  controllers: [MapsController],
  providers: [MapsService],
})
export class UsersMapsModule {}
