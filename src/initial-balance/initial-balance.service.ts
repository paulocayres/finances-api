import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInitialBalanceDto } from './dto/create-initial-balance.dto';
import { InitialBalance, InitialBalanceDocument } from './entities/initial-balance.entity';

@Injectable()
export class InitialBalanceService {
  constructor(
    @InjectModel(InitialBalance.name) private readonly initialBalanceModel: Model<InitialBalanceDocument>,
  ) {}

  async get(ownerId: string): Promise<InitialBalance> {
    console.log('entrou no get com ownerId:', ownerId);
    const balance = await this.initialBalanceModel.findOne({ ownerId });
    if (!balance) {
      throw new NotFoundException('Saldo inicial não cadastrado para este usuário.');
    }
    return balance;
  }

  async upsert(ownerId: string, dto: CreateInitialBalanceDto): Promise<InitialBalance> {
    const existing = await this.initialBalanceModel.findOne({ ownerId });
    if (existing) {
      existing.valor = dto.valor;
      existing.data = new Date(dto.data);
      return existing.save();
    }
    return this.initialBalanceModel.create({ ...dto, ownerId });
  }
}
