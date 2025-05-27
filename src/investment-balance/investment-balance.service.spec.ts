import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentBalanceService } from './investment-balance.service';

describe('InvestmentBalanceService', () => {
  let service: InvestmentBalanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvestmentBalanceService],
    }).compile();

    service = module.get<InvestmentBalanceService>(InvestmentBalanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
