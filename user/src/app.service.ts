import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  public constructor() {}

  getStatus(): string {
    return 'Ping from server!';
  }
}
