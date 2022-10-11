import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class WalletTransferDTO {
  @IsNotEmpty()
  @IsString()
  senderWalletId: string;

  @IsNotEmpty()
  @IsString()
  recieverWalletId: string;

  @IsPositive()
  amount: number;
}
