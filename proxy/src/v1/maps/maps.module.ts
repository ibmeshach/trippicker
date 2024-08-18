import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MapsService } from './maps.service';

@Module({
  imports: [],
  providers: [MapsService],
})
export class MapsModule {}
