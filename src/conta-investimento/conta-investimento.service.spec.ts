import { Test, TestingModule } from '@nestjs/testing';
import { ContaInvestimentoService } from './conta-investimento.service';

describe('ContaInvestimentoService', () => {
  let service: ContaInvestimentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContaInvestimentoService],
    }).compile();

    service = module.get<ContaInvestimentoService>(ContaInvestimentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
