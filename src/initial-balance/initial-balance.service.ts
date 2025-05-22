import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
//import { InitialBalance, InitialBalanceDocument } from './schemas/initial-balance.schema';
import { CreateInitialBalanceDto } from './dto/create-initial-balance.dto';
//import { UpdateInitialBalanceDto } from './dto/update-initial-balance.dto';
import { InitialBalance, InitialBalanceDocument } from './entities/initial-balance.entity';

@Injectable()
export class InitialBalanceService {
  constructor(
    @InjectModel(InitialBalance.name) private readonly initialBalanceModel: Model<InitialBalanceDocument>,
  ) {}

  async get(): Promise<InitialBalance> {
    console.log('entrou no get');
    const balance = await this.initialBalanceModel.findOne();
    if (!balance) {
      throw new NotFoundException('Saldo inicial não cadastrado.');
    }
    return balance;
  }

  async upsert(dto: CreateInitialBalanceDto): Promise<InitialBalance> {
    const existing = await this.initialBalanceModel.findOne();
    if (existing) {
      existing.valor = dto.valor;
      existing.data = new Date(dto.data);
      return existing.save();
    }
    return this.initialBalanceModel.create(dto);
  }
}

