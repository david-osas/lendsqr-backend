import { WalletService } from './wallet.service';
import { dummyWallet } from './constants.test';
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

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: {
            createWallet: createWalletMock,
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
});
