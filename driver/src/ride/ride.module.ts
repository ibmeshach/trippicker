import { Module } from '@nestjs/common';
import { RideService } from './ride.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from 'src/entities/rides.entity';
import { RideController } from './ride.controller';
import { DriverService } from 'src/driver/driver.service';
import { Driver } from 'src/entities/driver.entity';
import { RedisConfigService } from 'src/config/redis.service';
import { WalletService } from 'src/wallet/wallet.service';
import { Wallet } from 'src/entities/wallet.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ride, Driver, Wallet, User]),
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
  providers: [
    RideService,
    DriverService,
    RedisConfigService,
    WalletService,
    UserService,
  ],
  exports: [RideService],
  controllers: [RideController],
})
export class RideModule {}
