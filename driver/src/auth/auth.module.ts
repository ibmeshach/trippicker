import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { DriverService } from 'src/driver/driver.service';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from 'src/entities/driver.entity';
import { SmsService } from 'src/sms/sms.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([Driver]),
  ],
  controllers: [AuthController],
  providers: [AuthService, DriverService, SmsService],
})
export class AuthModule {}
