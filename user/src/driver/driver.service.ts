import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from 'src/entities/driver.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) {}

  async findDriverByPhoneNumber(phoneNumber: string): Promise<Driver> {
    const driver = await this.driverRepository.findOneBy({ phoneNumber });
    return driver;
  }

  async findDriverById(driverId: string): Promise<Driver | undefined> {
    const driver = await this.driverRepository.findOneBy({ id: driverId });

    if (driver) return driver;
    return undefined;
  }
}
