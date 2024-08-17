import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { SmsService } from 'src/sms/sms.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([User]),
    ClientsModule.register([
      {
        name: 'DRIVERS',
        transport: Transport.TCP,
        // options: {
        //   host: 'users-nestjs-backend.railway.internal',
        //   port: 3001,
        // },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, SmsService],
})
export class AuthModule {}
