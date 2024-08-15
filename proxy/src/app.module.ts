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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        { path: 'v1/auth/login', method: RequestMethod.POST },
        { path: 'v1/auth/signup', method: RequestMethod.POST },
        { path: 'v1/auth/verify-otp', method: RequestMethod.POST },
        { path: 'v1/auth/resend-otp', method: RequestMethod.POST },
      )
      .forRoutes('v1/*');
  }
}
