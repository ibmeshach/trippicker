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
import { MapsModule } from './v1/maps/maps.module';
import { UserRideModule } from './v1/users/ride/ride.module';
import { GatewayModule } from './v1/gateway/gateway.module';
import { EventsModule } from './v1/events/events.module';
import { ChatsModule } from './v1/chats/chats.module';
import { DriverRideModule } from './v1/drivers/ride/ride.module';
import { UsersModule } from './v1/users/users/users.module';
import { DriversModule } from './v1/drivers/drivers/drivers.module';
import { DriverRatingModule } from './v1/drivers/rating/rating.module';
import { UserRatingModule } from './v1/users/rating/rating.module';

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
        GOOGLE_MAPS_API_KEY: Joi.string().required(),
        JWT_ACCESS_TOKEN: Joi.string().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_CLOUD_NAME: Joi.string().required(),
      }),
    }),

    MapsModule,
    DriversAuthModule,
    UsersAuthModule,
    GatewayModule,
    UserRideModule,
    DriverRideModule,
    EventsModule,
    ChatsModule,
    UsersModule,
    DriversModule,
    DriverRatingModule,
    UserRatingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        { path: 'v1/users/auth/login', method: RequestMethod.POST },
        { path: 'v1/users/auth/signup', method: RequestMethod.POST },
        { path: 'v1/users/auth/verify-otp', method: RequestMethod.POST },
        { path: 'v1/users/auth/resend-otp', method: RequestMethod.POST },
        { path: 'v1/drivers/auth/login', method: RequestMethod.POST },
        { path: 'v1/drivers/auth/verify-otp', method: RequestMethod.POST },
        { path: 'v1/drivers/auth/resend-otp', method: RequestMethod.POST }
      )
      .forRoutes('v1/*');
  }
}
