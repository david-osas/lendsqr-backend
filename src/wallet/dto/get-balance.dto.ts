import { IsNotEmpty, IsString } from 'class-validator';

export class GetBalanceDto {
  @IsNotEmpty()
  @IsString()
  walletId: string;
}
