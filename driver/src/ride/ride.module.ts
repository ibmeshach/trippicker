import { Module } from '@nestjs/common';
import { RideService } from './ride.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from 'src/entities/rides.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ride])],
  providers: [RideService],
  exports: [RideService],
})
export class RideModule {}
