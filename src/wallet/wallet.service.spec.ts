import { Test } from '@nestjs/testing';
import { dummyWallet } from './constants.test';
import { WalletService } from './wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';

describe('Wallet Service', () => {
  let walletService: WalletService;
  const createMock = jest
    .fn()
    .mockImplementation(({ userId }: { userId: string }) => ({
      ...dummyWallet,
      userId,
    }));
  const saveMock = jest.fn().mockImplementation(async (wallet) => wallet);

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: {
            create: createMock,
            save: saveMock,
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

    expect(createMock).toBeCalledTimes(1);
    expect(saveMock).toBeCalledTimes(1);
    expect(wallet).toEqual({ ...dummyWallet, userId });
  });
});
