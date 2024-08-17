import { Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from 'src/entities/driver.entity';
import { DriverController } from './driver.controller';
import { AuthService } from 'src/auth/auth.service';
import { SmsService } from 'src/sms/sms.service';

@Module({
  imports: [TypeOrmModule.forFeature([Driver])],
  providers: [DriverService, AuthService, SmsService],
  controllers: [DriverController],
})
export class DriverModule {}
