import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PeriodUnit, RecurrenceType } from './enums';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) { }



  private calcularMaxOcorrencias(periodo: PeriodUnit): number {
    switch (periodo) {
      case PeriodUnit.DIA:
        return 365 * 10; // 10 anos em dias
      case PeriodUnit.SEMANA:
        return 52 * 10;  // 10 anos em semanas
      case PeriodUnit.MES:
        return 12 * 10;  // 10 anos em meses
      case PeriodUnit.ANO:
        return 10;       // 10 anos
      default:
        return 0;
    }
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
    }
    return novaData;
  }

  async findBeforeDate(date: Date) {
    return this.transactionModel.find({
      data: { $lt: date },
    }).exec();
  }



  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction[]> {
    const {
      recorrencia,
      numeroParcelas,
      unidadePeriodo,
      data,
      ...rest
    } = createTransactionDto;


    // ⬇️ Validação de consistência entre os campos
    if (recorrencia === RecurrenceType.PARCELADA) {
      if (!numeroParcelas || numeroParcelas <= 1) {
        throw new BadRequestException('Número de parcelas inválido para transações parceladas.');
      }
      if (unidadePeriodo) {
        throw new BadRequestException('Transações parceladas não devem ter período.');
      }
    }

    if (recorrencia === RecurrenceType.RECORRENTE) {
      if (!unidadePeriodo) {
        throw new BadRequestException('Transações recorrentes devem ter um período definido.');
      }
      if (numeroParcelas) {
        throw new BadRequestException('Transações recorrentes não devem ter número de parcelas.');
      }
    }

    const dataInicial = new Date(data);


    const groupId = recorrencia === RecurrenceType.PARCELADA || recorrencia === RecurrenceType.RECORRENTE ? uuidv4() : null;

    if (recorrencia === RecurrenceType.PARCELADA && numeroParcelas && numeroParcelas > 1) {
      const transacoes: Transaction[] = [];

      for (let i = 0; i < numeroParcelas; i++) {
        const novaData = this.adicionarPeriodo(dataInicial, PeriodUnit.MES, i); // sempre mensal
        novaData.setMonth(novaData.getMonth() + i);

        const transacao = new this.transactionModel({
          ...rest,
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

    // Recorrente
    if (recorrencia === RecurrenceType.RECORRENTE && unidadePeriodo) {
      const transacoes: Transaction[] = [];
      const maxOcorrencias = this.calcularMaxOcorrencias(unidadePeriodo);

      for (let i = 0; i < maxOcorrencias; i++) {
        const novaData = this.adicionarPeriodo(dataInicial, unidadePeriodo, i);

        switch (unidadePeriodo) {
          case PeriodUnit.DIA:
            novaData.setDate(novaData.getDate() + i);
            break;
          case PeriodUnit.SEMANA:
            novaData.setDate(novaData.getDate() + i * 7);
            break;
          case PeriodUnit.MES:
            novaData.setMonth(novaData.getMonth() + i);
            break;
          case PeriodUnit.ANO:
            novaData.setFullYear(novaData.getFullYear() + i);
            break;
        }

        const transacao = new this.transactionModel({
          ...rest,
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


    // Transação única ou recorrente simples
    const transacaoUnica = new this.transactionModel({
      ...createTransactionDto,
    });

    return [await transacaoUnica.save()];

  }

  /*async findAll(): Promise<Transaction[]> {
    return this.transactionModel.find().exec();
  }*/

  async findByPeriod(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.transactionModel.find({
      data: {
        $gte: startDate,
        $lte: endDate,
      },
    }).exec();
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) {
      throw new NotFoundException(`Transação com id ${id} não encontrada`);
    }
    return transaction;
  }

  /*async update(id: string, updateDto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.transactionModel.findByIdAndUpdate(id, updateDto, { new: true });
    if (!transaction) {
      throw new NotFoundException(`Transação com id ${id} não encontrada`);
    }
    return transaction;
  }*/

  async update(id: string, updateDto: UpdateTransactionDto): Promise<Transaction> {
    const transacao = await this.transactionModel.findById(id);

    if (!transacao) {
      throw new NotFoundException('Transação não encontrada.');
    }

    if (transacao.recorrencia !== RecurrenceType.UNICA) {
      throw new ForbiddenException('Somente transações únicas podem ser alteradas.');
    }

    if (!transacao.descricao && !transacao.valor && !transacao.tipo && !transacao.data) {
      throw new BadRequestException('Nenhum dado foi enviado para atualização.');
    }

    // Somente atualiza os campos permitidos
    const { descricao, valor, tipo, data } = updateDto;
    transacao.descricao = descricao || transacao.descricao;
    transacao.valor = valor || transacao.valor;
    transacao.tipo = tipo || transacao.tipo;
    transacao.data = data || transacao.data;

    return transacao.save();
  }


  async remove(id: string): Promise<any> {
    const transaction = await this.transactionModel.findById(id).exec();
    console.log(id);

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    if (transaction.recorrencia === RecurrenceType.PARCELADA || transaction.recorrencia === RecurrenceType.RECORRENTE) {
      // Para transações parceladas ou recorrentes, excluir todas as transações com o mesmo groupId
      return this.transactionModel.deleteMany({ groupId: transaction.groupId }).exec();
    }

    // Excluir somente a transação única
    return this.transactionModel.deleteOne({ _id: id }).exec();
  }
}
