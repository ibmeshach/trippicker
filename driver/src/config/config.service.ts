import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class ConfigDatabaseService {
  constructor(private configService: ConfigService) {}

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',

      host: this.configService.get<string>('POSTGRES_HOST'),
      port: parseInt(this.configService.get<string>('POSTGRES_PORT')),
      username: this.configService.get<string>('POSTGRES_USER'),
      password: this.configService.get<string>('POSTGRES_PASSWORD'),
      database: this.configService.get<string>('POSTGRES_DATABASE'),

      entities: ['dist/**/*.entity{.ts,.js}'],

      migrationsTableName: 'migration',

      // only during development
      synchronize: true,

      // migrations: ['src/migration/*.ts'],
      migrations: ['dist/migration/*.ts'],

      // ssl: {
      //   rejectUnauthorized: true, // Set to true in production for enhanced security
      // },
    };
  }
}
