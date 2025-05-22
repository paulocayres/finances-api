import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PeriodUnit } from './enums'
import { RecurrenceType } from './enums';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>
  ) {}

  async create(createTransactionDto: CreateTransactionDto, ownerId: string): Promise<Transaction[]> {
    const { recorrencia, numeroParcelas, unidadePeriodo, data, ...rest } = createTransactionDto;

    if (recorrencia === RecurrenceType.PARCELADA && (!numeroParcelas || numeroParcelas < 1)) {
      throw new BadRequestException('Número de parcelas inválido para recorrência parcelada.');
    }

    if (recorrencia === RecurrenceType.RECORRENTE && !unidadePeriodo) {
      throw new BadRequestException('Unidade de período é obrigatória para recorrência recorrente.');
    }

    const dataInicial = new Date(data);
    const groupId = (recorrencia === RecurrenceType.PARCELADA || recorrencia === RecurrenceType.RECORRENTE) ? uuidv4() : null;

    if (recorrencia === RecurrenceType.PARCELADA && numeroParcelas && numeroParcelas > 1) {
      const transacoes: Transaction[] = [];

      for (let i = 0; i < numeroParcelas; i++) {
        const novaData = this.adicionarPeriodo(dataInicial, PeriodUnit.MES, i);

        const transacao = new this.transactionModel({
          ...rest,
          ownerId,
          recorrencia,
          numeroParcelas,
          numeroParcela: i + 1,
          data: novaData,
          groupId,
        });

        transacoes.push(transacao);
      }

      return await this.transactionModel.insertMany(transacoes);
    }

    if (recorrencia === RecurrenceType.RECORRENTE && unidadePeriodo) {
      const transacoes: Transaction[] = [];
      const maxOcorrencias = this.calcularMaxOcorrencias(unidadePeriodo);

      for (let i = 0; i < maxOcorrencias; i++) {
        const novaData = this.adicionarPeriodo(dataInicial, unidadePeriodo, i);

        const transacao = new this.transactionModel({
          ...rest,
          ownerId,
          recorrencia,
          unidadePeriodo,
          numeroParcela: i + 1,
          data: novaData,
          groupId,
        });

        transacoes.push(transacao);
      }

      return await this.transactionModel.insertMany(transacoes);
    }

    const transacaoUnica = new this.transactionModel({
      ...createTransactionDto,
      ownerId,
    });

    return [await transacaoUnica.save()];
  }

  async findByPeriod(startDate: Date, endDate: Date, ownerId: string): Promise<Transaction[]> {
    return this.transactionModel.find({
      ownerId,
      data: { $gte: startDate, $lte: endDate },
    }).exec();
  }

  async findBeforeDate(date: Date, ownerId: string): Promise<Transaction[]> {
    return this.transactionModel.find({
      ownerId,
      data: { $lt: date },
    }).exec();
  }

  async findOne(id: string, ownerId: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) {
      throw new NotFoundException(`Transação com id ${id} não encontrada`);
    }
    if (transaction.ownerId !== ownerId) {
      throw new ForbiddenException('Acesso negado a esta transação');
    }
    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto, ownerId: string): Promise<Transaction> {
    const transacao = await this.transactionModel.findById(id);
    if (!transacao) {
      throw new NotFoundException('Transação não encontrada.');
    }
    if (transacao.ownerId !== ownerId) {
      throw new ForbiddenException('Acesso negado a esta transação.');
    }

    const { recorrencia, numeroParcelas, unidadePeriodo, data, ...rest } = updateTransactionDto;

    if (recorrencia === RecurrenceType.PARCELADA && (!numeroParcelas || numeroParcelas < 1)) {
      throw new BadRequestException('Número de parcelas inválido para recorrência parcelada.');
    }

    if (recorrencia === RecurrenceType.RECORRENTE && !unidadePeriodo) {
      throw new BadRequestException('Unidade de período é obrigatória para recorrência recorrente.');
    }

    const dataInicial = new Date(data);
    const groupId = (recorrencia === RecurrenceType.PARCELADA || recorrencia === RecurrenceType.RECORRENTE) ? uuidv4() : null;

    if (recorrencia === RecurrenceType.PARCELADA && numeroParcelas && numeroParcelas > 1) {
      await this.transactionModel.deleteMany({ groupId: transacao.groupId, ownerId });

      const transacoes: Transaction[] = [];

      for (let i = 0; i < numeroParcelas; i++) {
        const novaData = this.adicionarPeriodo(dataInicial, PeriodUnit.MES, i);

        const novaTransacao = new this.transactionModel({
          ...rest,
          ownerId,
          recorrencia,
          numeroParcelas,
          numeroParcela: i + 1,
          data: novaData,
          groupId,
        });

        transacoes.push(novaTransacao);
      }

      await this.transactionModel.insertMany(transacoes);

      return transacoes[0];
    }

    if (recorrencia === RecurrenceType.RECORRENTE && unidadePeriodo) {
      await this.transactionModel.deleteMany({ groupId: transacao.groupId, ownerId });

      const transacoes: Transaction[] = [];
      const maxOcorrencias = this.calcularMaxOcorrencias(unidadePeriodo);

      for (let i = 0; i < maxOcorrencias; i++) {
        const novaData = this.adicionarPeriodo(dataInicial, unidadePeriodo, i);

        const novaTransacao = new this.transactionModel({
          ...rest,
          ownerId,
          recorrencia,
          unidadePeriodo,
          numeroParcela: i + 1,
          data: novaData,
          groupId,
        });

        transacoes.push(novaTransacao);
      }

      await this.transactionModel.insertMany(transacoes);

      return transacoes[0];
    }

    Object.assign(transacao, updateTransactionDto, { ownerId });

    return await transacao.save();
  }

  async remove(id: string, ownerId: string): Promise<any> {
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }
    if (transaction.ownerId !== ownerId) {
      throw new ForbiddenException('Acesso negado a esta transação');
    }

    if (transaction.recorrencia === RecurrenceType.PARCELADA || transaction.recorrencia === RecurrenceType.RECORRENTE) {
      return this.transactionModel.deleteMany({ groupId: transaction.groupId, ownerId }).exec();
    }

    return this.transactionModel.deleteOne({ _id: id, ownerId }).exec();
  }

  private adicionarPeriodo(data: Date, unidade: PeriodUnit, quantidade: number): Date {
    const novaData = new Date(data);
    switch (unidade) {
      case PeriodUnit.DIA:
        novaData.setDate(novaData.getDate() + quantidade);
        break;
      case PeriodUnit.SEMANA:
        novaData.setDate(novaData.getDate() + 7 * quantidade);
        break;
      case PeriodUnit.MES:
        novaData.setMonth(novaData.getMonth() + quantidade);
        break;
      case PeriodUnit.ANO:
        novaData.setFullYear(novaData.getFullYear() + quantidade);
        break;
      default:
        throw new BadRequestException('Unidade de período inválida.');
    }
    return novaData;
  }

  private calcularMaxOcorrencias(unidade: PeriodUnit): number {
    switch (unidade) {
      case PeriodUnit.DIA:
        return 365;
      case PeriodUnit.SEMANA:
        return 52;
      case PeriodUnit.MES:
        return 12;
      case PeriodUnit.ANO:
        return 5;
      default:
        throw new BadRequestException('Unidade de período inválida.');
    }
  }
}
