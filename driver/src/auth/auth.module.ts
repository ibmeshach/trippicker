import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { DriverService } from 'src/driver/driver.service';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from 'src/entities/driver.entity';
import { SmsService } from 'src/sms/sms.service';
import { RedisConfigService } from 'src/config/redis.service';
import { Wallet } from 'src/entities/wallet.entity';
import { WalletService } from 'src/wallet/wallet.service';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, Wallet])],
  controllers: [AuthController],
  providers: [
    AuthService,
    DriverService,
    SmsService,
    RedisConfigService,
    WalletService,
    Logger,
  ],
})
export class AuthModule {}
