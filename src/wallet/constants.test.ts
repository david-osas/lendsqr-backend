import { WalletFundFlowDTO } from './dto/wallet-fund-flow.dto';
import { WalletTransferDTO } from './dto/wallet-transfer.dto';
import { Transaction } from './entities/transaction.entity';
import { Wallet } from './entities/wallet.entity';
import { TransactionType } from './wallet.interface';

export const wrongWalletId = 'wrong wallet id';

export const dummyBalance = 2000;

export const dummyWallet: Wallet = {
  id: 'dummy wallet id',
  userId: 'dummy user id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const dummyTransaction: Transaction = {
  id: 'dummy transaction id',
  amount: 10000,
  senderId: 'dummy sender id',
  receiverId: 'dummy receiver id',
  transactionType: TransactionType.INFLOW,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const dummyWalletTransferDTO: WalletTransferDTO = {
  senderWalletId: dummyTransaction.senderId,
  receiverWalletId: dummyTransaction.receiverId,
  amount: 1000,
};

export const dummyWalletFundFlowDTO: WalletFundFlowDTO = {
  amount: 1000,
  paymentProviderId: 'dummy payment provider id',
  walletId: dummyWallet.id,
};
