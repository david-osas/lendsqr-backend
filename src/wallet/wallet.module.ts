import { Transaction } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Module } from '@nestjs/common';
import { Wallet } from './entities/wallet.entity';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction])],
  providers: [
    {
      provide: 'OUTFLOW_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBIT_MQ_URL || ''],
            queue: 'outflow_queue',
            noAck: false,
            queueOptions: {
              durable: true,
            },
          },
        });
      },
    },
    WalletService,
  ],
  controllers: [WalletController],
})
export class WalletModule {}
