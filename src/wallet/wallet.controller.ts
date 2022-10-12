import { GetBalanceDto } from './dto/get-balance.dto';
import { WalletFundFlowDTO } from './dto/wallet-fund-flow.dto';
import { NotFoundError } from './../utils/errors';
import { Transaction } from './entities/transaction.entity';
import { WalletTransferDTO } from './dto/wallet-transfer.dto';
import { WalletService } from './wallet.service';
import { CreateWalletDTO } from './dto/create-wallet.dto';
import { Controller, Post, Get, Body, NotFoundException } from '@nestjs/common';
import { OutFlowRequest, TransactionType } from './wallet.interface';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async createWallet(@Body() createDTO: CreateWalletDTO) {
    return await this.walletService.createWallet(createDTO);
  }

  @Get('balance')
  async getBalance(@Body() getBalanceDTO: GetBalanceDto) {
    const balance = await this.walletService.getBalance(getBalanceDTO.walletId);

    return { balance };
  }

  @Post('transfer')
  async walletTransfer(@Body() walletTransferDTO: WalletTransferDTO) {
    this.walletService.sendRequestToOutflowQueue(
      walletTransferDTO,
      TransactionType.TRANSFER,
    );

    return {
      message:
        'Transfer request has been successfully received. Check your balance later to view the update.',
    };
  }

  @Post('fund')
  async fundWallet(@Body() fundFlowDTO: WalletFundFlowDTO) {
    let transaction: Transaction;

    try {
      transaction = await this.walletService.fundWallet(fundFlowDTO);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      } else {
        throw error;
      }
    }

    return transaction;
  }

  @Post('withdraw')
  async withdrawFromWallet(@Body() withdrawFundFlowDTO: WalletFundFlowDTO) {
    this.walletService.sendRequestToOutflowQueue(
      withdrawFundFlowDTO,
      TransactionType.WITHDRAW,
    );

    return {
      message:
        'Withdrawal request has been successfully received. Check your balance later to view the update.',
    };
  }

  @EventPattern('add-outflow')
  async processOutFlowRequests(
    @Payload() request: OutFlowRequest,
    @Ctx() context: RmqContext,
  ) {
    await this.walletService.processOutFlowRequests(request);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
