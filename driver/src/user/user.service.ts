import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  async findUserByPhoneNumber(phoneNumber: string) {
    return await this.usersRepository.findOneBy({ phoneNumber });
  }
  create(createUserData: Partial<User>) {
    const user = this.usersRepository.create(createUserData);
    return user;
  }
}
