import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from 'src/entities/wallet.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async findWalletByDriverId(driverId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOneBy({ driverId });
    return wallet;
  }

  async updateWallet(walletId: string, updateOptions: Partial<Wallet>) {
    await this.walletRepository.update(
      {
        id: walletId,
      },
      updateOptions,
    );
  }

  create(createWalletData: Partial<Wallet>) {
    const wallet = this.walletRepository.create(createWalletData);
    return wallet;
  }
}
