import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomException } from 'src/custom.exception';
import { User } from 'src/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { GetNearestDriversEvent } from './user.events';
import { catchError } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject('DRIVERS') private readonly driversClient: ClientProxy,
  ) {}

  async findUserByPhoneNumberLock(
    phoneNumber: string,
    manager: EntityManager,
  ): Promise<User | undefined> {
    const user = manager
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber })
      .setLock('pessimistic_write')
      .getOne();

    if (user) return user;

    return undefined;
  }

  async findUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      where: { phoneNumber },
    });

    if (user) return user;

    return undefined;
  }

  async findUserById(userId: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (user) return user;
    return undefined;
  }

  create(createUserData: SignupProps) {
    const user = this.usersRepository.create(createUserData);
    return user;
  }

  async updateOtpToken(updateOptions: {
    phoneNumber: string;
    otpToken: string;
  }): Promise<User> {
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

  async update(userId: string, updateOptions: Partial<User>) {
    return await this.usersRepository.update(
      {
        id: userId,
      },
      updateOptions,
    );
  }

  async updateUserLocation(
    userId: string,
    storeOptions: updateLocationOptions,
  ) {
    return await this.update(userId, storeOptions);
  }

  async getNearestDrivers(data: getNearestDriverProps) {
    const drivers = this.driversClient
      .send('driver.getNearestDrivers', new GetNearestDriversEvent(data))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    return drivers;
  }
}
