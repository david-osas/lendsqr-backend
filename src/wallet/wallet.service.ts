import { FindWalletDTO } from './dto/find-wallet.dto';
import { ForbiddenError, NotFoundError } from './../utils/errors';
import { WalletTransferDTO } from './dto/wallet-transfer.dto';
import { CreateWalletDTO } from './dto/create-wallet.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionType } from './wallet.interface';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async createWallet(createDTO: CreateWalletDTO) {
    const wallet = this.walletRepository.create(createDTO);
    return await this.walletRepository.save(wallet);
  }

  async walletTransfer(transferDTO: WalletTransferDTO) {
    const { senderWalletId, recieverWalletId, amount } = transferDTO;

    const senderWallet = await this.findOneWallet({ id: senderWalletId });
    if (!senderWallet) {
      throw new NotFoundError('no sender wallet found');
    }
    const receiverWallet = await this.findOneWallet({ id: recieverWalletId });
    if (!receiverWallet) {
      throw new NotFoundError('no receiver wallet found');
    }

    const senderBalance = await this.getBalance(senderWalletId);
    if (senderBalance < amount) {
      throw new ForbiddenError(
        "sender's balance is insufficient for this operation",
      );
    }

    const transaction = this.transactionRepository.create({
      ...transferDTO,
      completedAt: new Date(),
      transactionType: TransactionType.TRANSFER,
    });

    return await this.transactionRepository.save(transaction);
  }

  async findOneWallet(findDTO: FindWalletDTO) {
    return await this.walletRepository.findOne({ where: { ...findDTO } });
  }

  async getBalance(walletId: string) {
    const totalCredit = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'sum')
      .where('transaction.receiver_id = :walletId', { walletId })
      .getRawOne();

    const totalDebit = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'sum')
      .where('transaction.sender_id = :walletId', { walletId })
      .getRawOne();

    const currentBalance = (totalCredit?.sum || 0) - (totalDebit?.sum || 0);

    return currentBalance;
  }
}
