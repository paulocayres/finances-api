import { Controller, Get, Put, Body } from '@nestjs/common';
//import { InitialBalanceService } from './initial-balance.service';
//import { CreateInitialBalanceDto } from './dto/create-initial-balance.dto';
//import { InitialBalance } from './entities/initial-balance.entity';
import { ContaInvestimentoService } from './conta-investimento.service';
import { CreateContaInvestimentoDto } from './dto/create-conta-investimento.dto';
import { ContaInvestimento } from './entities/conta-investimento.entity';
//import { InitialBalance } from './schemas/initial-balance.schema';

@Controller('conta-investimento')
export class ContaInvestimentoController {
  constructor(private readonly contaInvestimentoService: ContaInvestimentoService) {}

  @Get()
  async get(): Promise<ContaInvestimento> {
    return this.contaInvestimentoService.get();
  }

  @Put()
  async upsert(@Body() dto: CreateContaInvestimentoDto): Promise<ContaInvestimento> {
    return this.contaInvestimentoService.upsert(dto);
  }
}