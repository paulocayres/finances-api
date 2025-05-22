import { Controller, Get, Put, Body } from '@nestjs/common';
import { InitialBalanceService } from './initial-balance.service';
import { CreateInitialBalanceDto } from './dto/create-initial-balance.dto';
import { InitialBalance } from './entities/initial-balance.entity';
//import { InitialBalance } from './schemas/initial-balance.schema';

@Controller('initial-balance')
export class InitialBalanceController {
  constructor(private readonly initialBalanceService: InitialBalanceService) {}

  @Get()
  async get(): Promise<InitialBalance> {
    return this.initialBalanceService.get();
  }

  @Put()
  async upsert(@Body() dto: CreateInitialBalanceDto): Promise<InitialBalance> {
    return this.initialBalanceService.upsert(dto);
  }
}

