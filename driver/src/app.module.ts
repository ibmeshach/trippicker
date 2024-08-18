import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RideModule } from './ride/ride.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigDatabaseService } from './config/config.service';
import { DataSource } from 'typeorm';
import { DriverModule } from './driver/driver.module';
import { SmsModule } from './sms/sms.module';
import { RedisConfigService } from './config/redis.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DATABASE: Joi.string().required(),
        OTP_JWT_TOKEN: Joi.string().required(),
        JWT_ACCESS_TOKEN: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        CACHE_TTL: Joi.number().required(),
      }),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const configDatabaseService = new ConfigDatabaseService(configService);
        return configDatabaseService.getTypeOrmConfig();
      },
    }),
    AuthModule,
    RideModule,
    DriverModule,
    SmsModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {
  constructor(
    private dataSource: DataSource,
    private logger: Logger,
  ) {}
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
