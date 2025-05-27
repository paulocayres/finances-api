import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TransactionModule } from 'src/transaction/transaction.module';
import { InitialBalanceModule } from 'src/initial-balance/initial-balance.module';
import { ParseDatePipe } from 'src/pipes/parse-date.pipe';
import { InvestmentBalanceModule } from 'src/investment-balance/investment-balance.module';

@Module({
  imports: [TransactionModule, InitialBalanceModule, InvestmentBalanceModule],
  controllers: [ReportsController],
  providers: [ParseDatePipe, ReportsService ],
})
export class ReportsModule { }
