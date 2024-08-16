import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './v1/users/auth/auth.module';
import { AuthenticationMiddleware } from './v1/middlewares/Authentication.middleware';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MapsModule } from './v1/users/maps/maps.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS',
        transport: Transport.TCP,
      },
      {
        name: 'DRIVERS',
        transport: Transport.TCP,
      },
    ]),
    JwtModule.register({
      global: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_ACCESS_TOKEN: Joi.string().required(),
        BASE_USER_URL: Joi.string().required(),
      }),
    }),

    AuthModule,
    MapsModule,
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
        { path: 'v1/users/maps/reverse-geocode', method: RequestMethod.GET },
      )
      .forRoutes('v1/*');
  }
}
