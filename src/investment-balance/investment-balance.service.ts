import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInvestmentBalanceDto } from './dto/create-investment-balance.dto';
import { InvestmentBalance, InvestmentBalanceDocument } from './entities/investment-balance.entity';

@Injectable()
export class InvestmentBalanceService {
  constructor(
    @InjectModel(InvestmentBalance.name) private readonly InvestmentBalanceModel: Model<InvestmentBalanceDocument>,
  ) {}

  async get(ownerId: string): Promise<InvestmentBalance> {
    //console.log('entrou no get Conta Investimento com ownerId:', ownerId);
    const balance = await this.InvestmentBalanceModel.findOne({ ownerId });
    if (!balance) {
      throw new NotFoundException('Saldo da Conta Investimento não cadastrado para este usuário.');
    }
    return balance;
  }

  async upsert(ownerId: string, dto: CreateInvestmentBalanceDto): Promise<InvestmentBalance> {
    const existing = await this.InvestmentBalanceModel.findOne({ ownerId });
    if (existing) {
      existing.valor = dto.valor;
      existing.data = new Date(dto.data);
      return existing.save();
    }
    return this.InvestmentBalanceModel.create({ ...dto, ownerId });
  }
}
