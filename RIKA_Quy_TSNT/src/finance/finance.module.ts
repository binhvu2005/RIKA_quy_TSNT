import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FundsController } from './funds.controller';
import { FundsService } from './funds.service';
import { FinanceTransactionsController } from './finance-transactions.controller';
import { FinanceTransactionsService } from './finance-transactions.service';
import { Fund, FundSchema } from './schemas/fund.schema';
import {
  FinanceTransaction,
  FinanceTransactionSchema,
} from './schemas/finance-transaction.schema';

/**
 * Finance Module
 * Module quản lý tài chính và kế toán
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Fund.name, schema: FundSchema },
      { name: FinanceTransaction.name, schema: FinanceTransactionSchema },
    ]),
  ],
  controllers: [FundsController, FinanceTransactionsController],
  providers: [FundsService, FinanceTransactionsService],
  exports: [FundsService, FinanceTransactionsService],
})
export class FinanceModule {}

