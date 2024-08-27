import { Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from 'src/entities/driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Driver])],
  providers: [DriverService],
  controllers: [DriverController],
})
export class DriverModule {}
