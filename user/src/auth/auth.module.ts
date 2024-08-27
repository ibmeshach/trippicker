import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { SmsService } from 'src/sms/sms.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { AppService } from '../app.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule, // Ensure ConfigModule is imported

    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([User]),
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
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, SmsService, AppService],
})
export class AuthModule {}
