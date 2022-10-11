import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class WalletFundFlowDTO {
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsString()
  walletId: string;

  @IsNotEmpty()
  @IsString()
  paymentProviderId: string;
}
