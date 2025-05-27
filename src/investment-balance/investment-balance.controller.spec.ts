import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentBalanceController } from './investment-balance.controller';
import { InvestmentBalanceService } from './investment-balance.service';

describe('InvestmentBalanceController', () => {
  let controller: InvestmentBalanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestmentBalanceController],
      providers: [InvestmentBalanceService],
    }).compile();

    controller = module.get<InvestmentBalanceController>(InvestmentBalanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
