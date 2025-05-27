import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { InvestmentBalanceService } from './investment-balance.service';
import { CreateInvestmentBalanceDto } from './dto/create-investment-balance.dto';
import { InvestmentBalance } from './entities/investment-balance.entity';
import { FirebaseAuthGuard } from 'src/firebase/firebase-auth.guard';

@Controller('investment-balance')
@UseGuards(FirebaseAuthGuard)
export class InvestmentBalanceController {
  constructor(private readonly InvestmentBalanceService: InvestmentBalanceService) {}

  @Get()
  async get(@Req() req): Promise<InvestmentBalance> {
    const user = req.user;
    return this.InvestmentBalanceService.get(user.uid);
  }

  @Put()
  async upsert(@Req() req, @Body() dto: CreateInvestmentBalanceDto): Promise<InvestmentBalance> {
    const user = req.user;
    return this.InvestmentBalanceService.upsert(user.uid, dto);
  }
}
