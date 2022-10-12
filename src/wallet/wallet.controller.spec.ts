import { NotFoundException } from '@nestjs/common';
import { NotFoundError } from './../utils/errors';
import { WalletService } from './wallet.service';
import {
  dummyBalance,
  dummyTransaction,
  dummyWallet,
  dummyWalletFundFlowDTO,
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

  const sendRequestToOutflowQueueMock = jest.fn();
  const processOutFlowRequestsMock = jest.fn();
  const fundWalletMock = jest
    .fn()
    .mockImplementation(async () => dummyTransaction);
  const getBalanceMock = jest.fn().mockImplementation(async () => dummyBalance);

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: {
            createWallet: createWalletMock,
            sendRequestToOutflowQueue: sendRequestToOutflowQueueMock,
            processOutFlowRequests: processOutFlowRequestsMock,
            fundWallet: fundWalletMock,
            getBalance: getBalanceMock,
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

  it('should get wallet balance', async () => {
    const balance = await walletController.getBalance({
      walletId: 'dummy wallet id',
    });

    expect(getBalanceMock).toBeCalledTimes(1);
    expect(balance).toEqual({ balance: dummyBalance });
  });

  it('should process wallet transfer', async () => {
    const response = await walletController.walletTransfer(
      dummyWalletTransferDTO,
    );

    expect(sendRequestToOutflowQueueMock).toBeCalledTimes(1);
    expect(response.message.length).toBeGreaterThan(0);
  });

  it('should process wallet withdrawal', async () => {
    const response = await walletController.withdrawFromWallet(
      dummyWalletFundFlowDTO,
    );

    expect(sendRequestToOutflowQueueMock).toBeCalledTimes(1);
    expect(response.message.length).toBeGreaterThan(0);
  });

  it('should process wallet funding', async () => {
    const transaction = await walletController.fundWallet(
      dummyWalletFundFlowDTO,
    );

    expect(fundWalletMock).toBeCalledTimes(1);
    expect(transaction).toEqual(dummyTransaction);
  });

  it('should throw not found exception when wallet resources are not found during wallet funding', async () => {
    fundWalletMock.mockImplementationOnce(async () => {
      throw new NotFoundError();
    });

    try {
      await walletController.fundWallet(dummyWalletFundFlowDTO);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }

    expect(fundWalletMock).toBeCalledTimes(1);
  });

  it('should process outflow requests', async () => {
    const outflowRequest: any = {};
    const ackMock = jest.fn();
    const dummyContext: any = {
      getMessage: () => ({}),
      getChannelRef: () => ({ ack: ackMock }),
    };
    await walletController.processOutFlowRequests(outflowRequest, dummyContext);

    expect(processOutFlowRequestsMock).toBeCalledTimes(1);
    expect(ackMock).toBeCalledTimes(1);
  });
});
