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

    // Assuming the credentials are a token, you can validate them here
    const isAuthenticated = this.validateRequestHeaders(apiKey);

    if (!isAuthenticated) {
      throw new UnauthorizedException('Unauthorized');
    }

    next();
  }

  validateRequestHeaders(requestApiKey: string) {
    const apiKey = this.configService.get<string>('USER_X_API_KEY');

    if (requestApiKey === apiKey) {
      return true;
    } else return false;
  }
}
