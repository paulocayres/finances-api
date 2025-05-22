import { Test, TestingModule } from '@nestjs/testing';
import { ContaInvestimentoController } from './conta-investimento.controller';
import { ContaInvestimentoService } from './conta-investimento.service';

describe('ContaInvestimentoController', () => {
  let controller: ContaInvestimentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContaInvestimentoController],
      providers: [ContaInvestimentoService],
    }).compile();

    controller = module.get<ContaInvestimentoController>(ContaInvestimentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
