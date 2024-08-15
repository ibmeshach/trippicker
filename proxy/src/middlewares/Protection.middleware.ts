import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ProtectionMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'] as string;
    const type = req.headers['server_type'] as string;

    // Assuming the credentials are a token, you can validate them here
    const isAuthenticated = this.validateRequestHeaders(apiKey, type);

    if (!isAuthenticated) {
      throw new UnauthorizedException('Unauthorized');
    }

    next();
  }

  validateRequestHeaders(requestApiKey: string, type: string) {
    const userApiKey = this.configService.get<string>('USER_X_API_KEY');
    const driverApiKey = this.configService.get<string>('DRIVER_X_API_KEY');
    const exchangeApiKey = this.configService.get<string>('EXCHANGE_X_API_KEY');

    switch (type) {
      case 'user':
        if (requestApiKey === userApiKey) {
          return true;
        } else return false;

      case 'driver':
        if (requestApiKey === driverApiKey) {
          return true;
        } else return false;

      case 'exchange':
        if (requestApiKey === exchangeApiKey) {
          return true;
        } else return false;

      default:
        return true;
    }
  }
}
