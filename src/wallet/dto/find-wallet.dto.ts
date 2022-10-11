import { IsNotEmpty, IsString } from 'class-validator';

export class FindWalletDTO {
  @IsNotEmpty()
  @IsString()
  id: string;
}
