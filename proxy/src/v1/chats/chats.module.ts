import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatGateway } from './chats.gateway';
import { MapsService } from '../maps/maps.service';
import { RideService } from '../users/ride/ride.service';
import { EventsModule } from '../events/events.module';

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
  providers: [ChatGateway, MapsService, RideService],
})
export class ChatsModule {}
