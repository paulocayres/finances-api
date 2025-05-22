import { Test, TestingModule } from '@nestjs/testing';
import { InitialBalanceController } from './initial-balance.controller';
import { InitialBalanceService } from './initial-balance.service';

describe('InitialBalanceController', () => {
  let controller: InitialBalanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InitialBalanceController],
      providers: [InitialBalanceService],
    }).compile();

    controller = module.get<InitialBalanceController>(InitialBalanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
