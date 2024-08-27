import { Module } from '@nestjs/common';
import { RideService } from './ride.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Ride } from 'src/entities/rides.entity';
import { RideController } from './ride.controller';
import { UserService } from 'src/user/user.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WalletService } from 'src/wallet/wallet.service';
import { Wallet } from 'src/entities/wallet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Ride, Wallet]),
    ClientsModule.register([
      {
        name: 'DRIVERS',
        transport: Transport.TCP,
        options: {
          // host: 'drivers-nestjs-backend.railway.internal',
          port: 3002,
        },
      },
    ]),
  ],
  providers: [RideService, UserService, WalletService],
  controllers: [RideController],
})
export class RideModule {}
