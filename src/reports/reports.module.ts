import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TransactionModule } from 'src/transaction/transaction.module';
import { InitialBalanceModule } from 'src/initial-balance/initial-balance.module';
import { ParseDatePipe } from 'src/pipes/parse-date.pipe';

@Module({
  imports: [TransactionModule, InitialBalanceModule],
  controllers: [ReportsController],
  providers: [ParseDatePipe, ReportsService ],
})
export class ReportsModule { }
