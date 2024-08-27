import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigDatabaseService } from './config/config.service';
import { UserService } from './user/user.service';
import * as Joi from '@hapi/joi';
import { User } from './entities/user.entity';
import { SmsModule } from './sms/sms.module';
import { RideModule } from './ride/ride.module';
import { Ride } from './entities/rides.entity';
import { UserModule } from './user/user.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatsModule } from './chats/chats.module';
import { TwilioModule } from 'nestjs-twilio';
import { DriverModule } from './driver/driver.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    TwilioModule.forRootAsync({
      isGlobal: true,
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        accountSid: cfg.get('TWILIO_ACCOUNT_SID'),
        authToken: cfg.get('TWILIO_AUTH_TOKEN'),
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_ACCESS_TOKEN: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DATABASE: Joi.string().required(),
        OTP_JWT_TOKEN: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const configDatabaseService = new ConfigDatabaseService(configService);
        return configDatabaseService.getTypeOrmConfig();
      },
    }),

    TwilioModule.forRoot({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    }),

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

    TypeOrmModule.forFeature([User, Ride]),
    AuthModule,
    RideModule,
    SmsModule,
    RideModule,
    UserModule,
    ChatsModule,
    DriverModule,
    WalletModule,
  ],

  controllers: [AppController],
  providers: [AppService, Logger, UserService],
})
export class AppModule implements NestModule {
  constructor(
    private dataSource: DataSource,
    private logger: Logger,
  ) {}

  configure(consumer: MiddlewareConsumer) {}

  async onModuleInit() {
    if (!this.dataSource.isInitialized) {
      this.dataSource
        .initialize()
        .then(() => {
          this.logger.debug('Database connected!');
        })
        .catch((err) => {
          console.error('Error connecting to database', err);
        });
    } else {
      console.log('Database already connected!');
    }
  }
}
