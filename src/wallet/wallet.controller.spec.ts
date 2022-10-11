import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError, NotFoundError } from './../utils/errors';
import { WalletService } from './wallet.service';
import {
  dummyTransaction,
  dummyWallet,
  dummyWalletTransferDTO,
} from './constants.test';
import { WalletController } from './wallet.controller';
import { Test } from '@nestjs/testing';

describe('Wallet Controller', () => {
  let walletController: WalletController;

  const createWalletMock = jest
    .fn()
    .mockImplementation(({ userId }: { userId: string }) => ({
      ...dummyWallet,
      userId,
    }));

  const walletTransferMock = jest
    .fn()
    .mockImplementation(async () => dummyTransaction);

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: {
            createWallet: createWalletMock,
            walletTransfer: walletTransferMock,
          },
        },
      ],
    }).compile();

    walletController = module.get<WalletController>(WalletController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create wallet account', async () => {
    const userId = '123456';
    const wallet = await walletController.createWallet({ userId });

    expect(createWalletMock).toBeCalledTimes(1);
    expect(wallet).toEqual({ ...dummyWallet, userId });
  });

  it('should process wallet transfer', async () => {
    const transaction = await walletController.walletTransfer(
      dummyWalletTransferDTO,
    );

    expect(walletTransferMock).toBeCalledTimes(1);
    expect(transaction).toEqual(dummyTransaction);
  });

  it('should throw forbidden exception on forbidden actions during wallet transfer', async () => {
    walletTransferMock.mockImplementationOnce(async () => {
      throw new ForbiddenError();
    });

    try {
      await walletController.walletTransfer(dummyWalletTransferDTO);
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
    }

    expect(walletTransferMock).toBeCalledTimes(1);
  });

  it('should throw not found exception when wallet resources are not found during wallet transfer', async () => {
    walletTransferMock.mockImplementationOnce(async () => {
      throw new NotFoundError();
    });

    try {
      await walletController.walletTransfer(dummyWalletTransferDTO);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }

    expect(walletTransferMock).toBeCalledTimes(1);
  });
});
