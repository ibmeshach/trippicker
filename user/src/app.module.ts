import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigDatabaseService } from './config/config.service';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import * as Joi from '@hapi/joi';
import { User } from './entities/user.entity';
import { ProtectionMiddleware } from './middleware/Protection.middleware';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        API_KEY: Joi.string().required(),
        USER_X_API_KEY: Joi.string().required(),
        JWT_ACCESS_TOKEN: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DATABASE: Joi.string().required(),
        TWILIO_ACCOUNT_SID: Joi.string().required(),
        TWILIO_AUTH_TOKEN: Joi.string().required(),
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

    TypeOrmModule.forFeature([User]),
    AuthModule,
    SmsModule,
  ],

  controllers: [AppController],
  providers: [AppService, Logger, UserService],
})
export class AppModule implements NestModule {
  constructor(
    private dataSource: DataSource,
    private logger: Logger,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProtectionMiddleware).forRoutes('*');
  }

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
