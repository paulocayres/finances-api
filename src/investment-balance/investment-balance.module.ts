import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvestmentBalanceService } from './investment-balance.service';
import { InvestmentBalanceController } from './investment-balance.controller';
import { InvestmentBalance, InvestmentBalanceSchema } from './entities/investment-balance.entity';
//import { InvestmentBalance, InvestmentBalanceSchema } from './schemas/Investment-balance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InvestmentBalance.name, schema: InvestmentBalanceSchema },
    ]),
  ],
  controllers: [InvestmentBalanceController],
  providers: [InvestmentBalanceService],
  exports: [InvestmentBalanceService],
})
export class InvestmentBalanceModule {}

