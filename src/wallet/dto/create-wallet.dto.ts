import { IsString, IsNotEmpty } from 'class-validator';

export class CreateWalletDTO {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
