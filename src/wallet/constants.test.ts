import { Wallet } from './entities/wallet.entity';

export const dummyWallet: Wallet = {
  id: 'dummy wallet id',
  userId: 'dummy user id',
  createdAt: new Date(),
  updatedAt: new Date(),
};
