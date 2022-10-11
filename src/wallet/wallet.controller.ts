import { WalletService } from './wallet.service';
import { CreateWalletDTO } from './dto/create-wallet.dto';
import { Controller, Post, Body } from '@nestjs/common';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async createWallet(@Body() createDTO: CreateWalletDTO) {
    return await this.walletService.createWallet(createDTO);
  }
}
