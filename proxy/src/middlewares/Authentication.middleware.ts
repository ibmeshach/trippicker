import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers['authorization'];
      if (token) {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get('JWT_ACCESS_TOKEN'),
        });

        req['user'] = payload;
        next();
      } else {
        throw new UnauthorizedException('No token provided');
      }
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
