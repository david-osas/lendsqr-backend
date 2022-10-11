import { Transaction } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Module } from '@nestjs/common';
import { Wallet } from './entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction])],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
