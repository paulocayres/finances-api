import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
//import { InitialBalance, InitialBalanceDocument } from './schemas/initial-balance.schema';
//import { CreateInitialBalanceDto } from './dto/create-initial-balance.dto';
//import { UpdateInitialBalanceDto } from './dto/update-initial-balance.dto';
//import { InitialBalance, InitialBalanceDocument } from './entities/initial-balance.entity';
import { ContaInvestimento, ContaInvestimentoDocument } from './entities/conta-investimento.entity';
import { CreateContaInvestimentoDto } from './dto/create-conta-investimento.dto';

@Injectable()
export class ContaInvestimentoService {
  constructor(
    @InjectModel(ContaInvestimento.name) private readonly ContaInvestimentoModel: Model<ContaInvestimentoDocument>,
  ) {}

  async get(): Promise<ContaInvestimento> {
    const balance = await this.ContaInvestimentoModel.findOne();
    if (!balance) {
      throw new NotFoundException('Saldo inicial não cadastrado.');
    }
    return balance;
  }

  async upsert(dto: CreateContaInvestimentoDto): Promise<ContaInvestimento> {
    const existing = await this.ContaInvestimentoModel.findOne();
    if (existing) {
      existing.valor = dto.valor;
      existing.data = new Date(dto.data);
      return existing.save();
    }
    return this.ContaInvestimentoModel.create(dto);
  }
}
