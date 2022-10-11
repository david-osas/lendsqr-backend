export enum TransactionType {
  FUND = 'FUND',
  TRANSFER = 'TRANSFER',
  WITHDRAW = 'WITHDRAW',
}

export interface OutFlowRequest {
  outflowDTO: any;
  transactionType: TransactionType;
}
