import { Logger, Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from 'src/entities/driver.entity';
import { DriverController } from './driver.controller';
import { AuthService } from 'src/auth/auth.service';
import { SmsService } from 'src/sms/sms.service';
import { RedisConfigService } from 'src/config/redis.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Driver]),
    ClientsModule.register([
      {
        name: 'USERS',
        transport: Transport.TCP,
        // options: {
        //   host: 'drivers-nestjs-backend.railway.internal',
        //   port: 3001,
        // },
      },
    ]),
  ],
  providers: [DriverService, SmsService, RedisConfigService],
  controllers: [DriverController],
})
export class DriverModule {}
