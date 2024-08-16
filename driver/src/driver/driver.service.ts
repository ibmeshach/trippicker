import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomException } from 'src/custom.exception';
import { Driver } from 'src/entities/driver.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private usersRepository: Repository<Driver>,
  ) {}

  async findDriverByPhoneNumberLock(
    phoneNumber: string,
    manager: EntityManager,
  ): Promise<Driver | undefined> {
    const driver = manager
      .getRepository(Driver)
      .createQueryBuilder('driver')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber })
      .setLock('pessimistic_write')
      .getOne();

    if (driver) return driver;

    return undefined;
  }

  async findDriverByPhoneNumber(
    phoneNumber: string,
  ): Promise<Driver | undefined> {
    const driver = await this.usersRepository.findOne({
      where: { phoneNumber },
    });

    if (driver) return driver;

    return undefined;
  }

  async findDriverById(driverId: string): Promise<Driver | undefined> {
    const driver = await this.usersRepository.findOneBy({ id: driverId });

    if (driver) return driver;
    return undefined;
  }

  create(createDriverData: SignupProps) {
    const driver = this.usersRepository.create(createDriverData);
    return driver;
  }

  async update(updateOptions: {
    phoneNumber: string;
    otpToken: string;
  }): Promise<Driver> {
    const { phoneNumber, otpToken } = updateOptions;
    const user = await this.usersRepository.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new CustomException(
        `User with phone number ${phoneNumber} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    user.otpToken = otpToken;
    await this.usersRepository.save(user);
    return user;
  }
}
