import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FundsController } from './funds.controller';
import { FundsService } from './funds.service';
import { FinanceTransactionsController } from './finance-transactions.controller';
import { FinanceTransactionsService } from './finance-transactions.service';
import { BankAccountsController } from './bank-accounts.controller';
import { BankAccountsService } from './bank-accounts.service';
import { Fund, FundSchema } from './schemas/fund.schema';
import {
  FinanceTransaction,
  FinanceTransactionSchema,
} from './schemas/finance-transaction.schema';
import { BankAccount, BankAccountSchema } from './schemas/bank-account.schema';

/**
 * Finance Module
 * Module quản lý tài chính và kế toán
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Fund.name, schema: FundSchema },
      { name: FinanceTransaction.name, schema: FinanceTransactionSchema },
      { name: BankAccount.name, schema: BankAccountSchema },
    ]),
  ],
  controllers: [FundsController, FinanceTransactionsController, BankAccountsController],
  providers: [FundsService, FinanceTransactionsService, BankAccountsService],
  exports: [FundsService, FinanceTransactionsService, BankAccountsService],
})
export class FinanceModule {}

