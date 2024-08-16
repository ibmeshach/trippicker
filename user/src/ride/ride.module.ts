import { Module } from '@nestjs/common';
import { RideService } from './ride.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Ride } from 'src/entities/rides.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Ride])],
  providers: [RideService],
})
export class RideModule {}
