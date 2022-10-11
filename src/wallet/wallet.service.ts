import { CreateWalletDTO } from './dto/create-wallet.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async createWallet(createDTO: CreateWalletDTO) {
    const wallet = this.walletRepository.create(createDTO);
    return await this.walletRepository.save(wallet);
  }
}
