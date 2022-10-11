import { NotFoundError, ForbiddenError } from './../utils/errors';
import { Transaction } from './entities/transaction.entity';
import { Test } from '@nestjs/testing';
import {
  dummyWallet,
  wrongWalletId,
  dummyTransaction,
  dummyWalletTransferDTO,
  dummyWalletFundFlowDTO,
} from './constants.test';
import { WalletService } from './wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { TransactionType } from './wallet.interface';

describe('Wallet Service', () => {
  let walletService: WalletService;
  const createWalletMock = jest
    .fn()
    .mockImplementation(({ userId }: { userId: string }) => ({
      ...dummyWallet,
      userId,
    }));
  const saveWalletMock = jest.fn().mockImplementation(async (wallet) => wallet);
  const findOneMock = jest
    .fn()
    .mockImplementation(async ({ where: { id } }) => {
      if (id === dummyWallet.id) {
        return dummyWallet;
      } else {
        return undefined;
      }
    });

  const getRawOneMock = jest.fn();
  const createQueryBuilderMock = jest.fn().mockImplementation(() => ({
    select: () => ({ where: () => ({ getRawOne: getRawOneMock }) }),
  }));
  const createTransactionMock = jest
    .fn()
    .mockImplementation(() => dummyTransaction);
  const saveTransactionMock = jest
    .fn()
    .mockImplementation(async () => dummyTransaction);
  const emitMock = jest.fn();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: {
            create: createWalletMock,
            save: saveWalletMock,
            findOne: findOneMock,
          },
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            createQueryBuilder: createQueryBuilderMock,
            create: createTransactionMock,
            save: saveTransactionMock,
          },
        },
        {
          provide: 'OUTFLOW_SERVICE',
          useValue: {
            emit: emitMock,
          },
        },
      ],
    }).compile();

    walletService = module.get<WalletService>(WalletService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create wallet account', async () => {
    const userId = '123456';
    const wallet = await walletService.createWallet({ userId });

    expect(createWalletMock).toBeCalledTimes(1);
    expect(saveWalletMock).toBeCalledTimes(1);
    expect(wallet).toEqual({ ...dummyWallet, userId });
  });

  it('should send outflow request to messaging queue for processing', async () => {
    const outflowRequest: any = {};
    walletService.sendRequestToOutflowQueue(
      outflowRequest,
      TransactionType.TRANSFER,
    );

    expect(emitMock).toBeCalledTimes(1);
  });

  it('should initiate wallet withdrawal if outflow request is a withdrawal', async () => {
    const withdrawSpy = jest
      .spyOn(walletService, 'withdrawFromWallet')
      .mockImplementation(async () => ({} as any));
    const outflowRequest = {
      transactionType: TransactionType.WITHDRAW,
      outflowDTO: {},
    };
    await walletService.processOutFlowRequests(outflowRequest);

    expect(withdrawSpy).toBeCalledTimes(1);
  });

  it('should initiate wallet transfer if outflow request is a transfer', async () => {
    const transferSpy = jest
      .spyOn(walletService, 'walletTransfer')
      .mockImplementation(async () => ({} as any));
    const outflowRequest = {
      transactionType: TransactionType.TRANSFER,
      outflowDTO: {},
    };
    await walletService.processOutFlowRequests(outflowRequest);

    expect(transferSpy).toBeCalledTimes(1);
  });

  it('should find one wallet with a valid wallet id', async () => {
    const wallet = await walletService.findOneWallet({ id: dummyWallet.id });

    expect(findOneMock).toBeCalledTimes(1);
    expect(wallet).toEqual(dummyWallet);
  });

  it('should not find wallet with wrong wallet id', async () => {
    const wallet = await walletService.findOneWallet({ id: wrongWalletId });

    expect(findOneMock).toBeCalledTimes(1);
    expect(wallet).toBeUndefined();
  });

  it('should get wallet balance', async () => {
    getRawOneMock.mockResolvedValueOnce({ sum: 2000 });
    getRawOneMock.mockResolvedValueOnce({ sum: 1000 });

    const balance = await walletService.getBalance(dummyWallet.id);

    expect(balance).toEqual(1000);
  });

  it('should return empty balance for wallet id that is not found', async () => {
    getRawOneMock.mockResolvedValueOnce(undefined);
    getRawOneMock.mockResolvedValueOnce(undefined);

    const balance = await walletService.getBalance(dummyWallet.id);

    expect(balance).toEqual(0);
  });

  it('should process wallet transfer', async () => {
    jest
      .spyOn(walletService, 'findOneWallet')
      .mockImplementation(async () => dummyWallet);
    jest
      .spyOn(walletService, 'getBalance')
      .mockImplementation(async () => dummyWalletTransferDTO.amount + 100);

    const transaction = await walletService.walletTransfer(
      dummyWalletTransferDTO,
    );

    expect(createTransactionMock).toBeCalledTimes(1);
    expect(saveTransactionMock).toBeCalledTimes(1);
    expect(transaction).toEqual(dummyTransaction);
  });

  it('should not process wallet transfer if no sender wallet is found', async () => {
    jest
      .spyOn(walletService, 'findOneWallet')
      .mockImplementation(async ({ id }) => {
        if (id !== dummyTransaction.senderId) {
          return undefined;
        }
        return dummyWallet;
      });

    try {
      await walletService.walletTransfer({
        ...dummyWalletTransferDTO,
        senderWalletId: wrongWalletId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }

    expect(createTransactionMock).toBeCalledTimes(0);
    expect(saveTransactionMock).toBeCalledTimes(0);
  });

  it('should not process wallet transfer if no receiver wallet is found', async () => {
    jest
      .spyOn(walletService, 'findOneWallet')
      .mockImplementation(async ({ id }) => {
        if (id !== dummyTransaction.receiverId) {
          return undefined;
        }
        return dummyWallet;
      });

    try {
      await walletService.walletTransfer({
        ...dummyWalletTransferDTO,
        receiverWalletId: wrongWalletId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }

    expect(createTransactionMock).toBeCalledTimes(0);
    expect(saveTransactionMock).toBeCalledTimes(0);
  });

  it('should not process wallet transfer if wallet balance is insufficient', async () => {
    jest
      .spyOn(walletService, 'findOneWallet')
      .mockImplementation(async () => dummyWallet);
    jest
      .spyOn(walletService, 'getBalance')
      .mockImplementation(async () => dummyWalletTransferDTO.amount - 100);

    try {
      await walletService.walletTransfer(dummyWalletTransferDTO);
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenError);
    }

    expect(createTransactionMock).toBeCalledTimes(0);
    expect(saveTransactionMock).toBeCalledTimes(0);
  });

  it('should process funding of a wallet', async () => {
    jest
      .spyOn(walletService, 'findOneWallet')
      .mockImplementation(async () => dummyWallet);

    const transaction = await walletService.fundWallet(dummyWalletFundFlowDTO);

    expect(createTransactionMock).toBeCalledTimes(1);
    expect(saveTransactionMock).toBeCalledTimes(1);
    expect(transaction).toEqual(dummyTransaction);
  });

  it('should not fund wallet if it is not found', async () => {
    jest
      .spyOn(walletService, 'findOneWallet')
      .mockImplementation(async () => undefined);

    try {
      await walletService.fundWallet(dummyWalletFundFlowDTO);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }

    expect(createTransactionMock).toBeCalledTimes(0);
    expect(saveTransactionMock).toBeCalledTimes(0);
  });

  it('should process wallet withdrawal', async () => {
    jest
      .spyOn(walletService, 'findOneWallet')
      .mockImplementation(async () => dummyWallet);
    jest
      .spyOn(walletService, 'getBalance')
      .mockImplementation(async () => dummyWalletFundFlowDTO.amount + 100);

    const transaction = await walletService.withdrawFromWallet(
      dummyWalletFundFlowDTO,
    );

    expect(createTransactionMock).toBeCalledTimes(1);
    expect(saveTransactionMock).toBeCalledTimes(1);
    expect(transaction).toEqual(dummyTransaction);
  });

  it('should not allow withdrawal if wallet is not found', async () => {
    jest
      .spyOn(walletService, 'findOneWallet')
      .mockImplementation(async () => undefined);

    try {
      await walletService.withdrawFromWallet(dummyWalletFundFlowDTO);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }

    expect(createTransactionMock).toBeCalledTimes(0);
    expect(saveTransactionMock).toBeCalledTimes(0);
  });

  it('should not allow withdrawal if wallet balance is insufficient', async () => {
    jest
      .spyOn(walletService, 'findOneWallet')
      .mockImplementation(async () => dummyWallet);
    jest
      .spyOn(walletService, 'getBalance')
      .mockImplementation(async () => dummyWalletFundFlowDTO.amount - 100);

    try {
      await walletService.withdrawFromWallet(dummyWalletFundFlowDTO);
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenError);
    }

    expect(createTransactionMock).toBeCalledTimes(0);
    expect(saveTransactionMock).toBeCalledTimes(0);
  });
});
