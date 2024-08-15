import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomException } from 'src/custom.exception';
import { User } from 'src/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

  async update(updateOptions: {
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
}
