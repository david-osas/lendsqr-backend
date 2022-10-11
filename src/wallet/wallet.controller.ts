import { ForbiddenError, NotFoundError } from './../utils/errors';
import { Transaction } from './entities/transaction.entity';
import { WalletTransferDTO } from './dto/wallet-transfer.dto';
import { WalletService } from './wallet.service';
import { CreateWalletDTO } from './dto/create-wallet.dto';
import {
  Controller,
  Post,
  Body,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async createWallet(@Body() createDTO: CreateWalletDTO) {
    return await this.walletService.createWallet(createDTO);
  }

  @Post('transfer')
  async walletTransfer(@Body() walletTransferDTO: WalletTransferDTO) {
    let transaction: Transaction;

    try {
      transaction = await this.walletService.walletTransfer(walletTransferDTO);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      } else if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      } else {
        throw error;
      }
    }

    return transaction;
  }
}
