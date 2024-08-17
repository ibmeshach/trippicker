import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersAuthModule } from './v1/users/auth/auth.module';
import { DriversAuthModule } from './v1/drivers/auth/auth.module';
import { AuthenticationMiddleware } from './v1/middlewares/Authentication.middleware';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersMapsModule } from './v1/users/maps/maps.module';
import { DriversMapsModule } from './v1/drivers/maps/maps.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS',
        transport: Transport.TCP,
        options: {
          host: 'users-nestjs-backend.railway.internal',
          port: 3001,
        },
      },
      {
        name: 'DRIVERS',
        transport: Transport.TCP,
        options: {
          host: 'drivers-nestjs-backend.railway.internal',
          port: 3002,
        },
      },
    ]),
    JwtModule.register({
      global: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_ACCESS_TOKEN: Joi.string().required(),
      }),
    }),

    DriversAuthModule,
    DriversMapsModule,
    UsersAuthModule,
    UsersMapsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        { path: 'v1/drivers/auth/login', method: RequestMethod.POST },
        { path: 'v1/users/auth/signup', method: RequestMethod.POST },
        { path: 'v1/users/auth/verify-otp', method: RequestMethod.POST },
        { path: 'v1/users/auth/resend-otp', method: RequestMethod.POST },
        { path: 'v1/drivers/maps/reverse-geocode', method: RequestMethod.GET },
      )
      .forRoutes('v1/*');
  }
}
