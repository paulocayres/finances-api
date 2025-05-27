import { Injectable } from '@nestjs/common';
import { InitialBalanceService } from 'src/initial-balance/initial-balance.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { GetMonthlyAgendaDto } from './dto/GetMonthlyAgendaDto';
import { TransactionType } from 'src/transaction/enums';
import * as dayjs from 'dayjs';
import { InvestmentBalanceService } from 'src/investment-balance/investment-balance.service';
import { ContaInvestimentoService } from 'src/conta-investimento/conta-investimento.service';
import { addMonths, isBefore, format } from 'date-fns';
import { SummaryResponseDto } from './dto/SummaryResponseDTO';
import { EvolucaoMensalDto } from './dto/EvolucaoMensalDTO';


@Injectable()
export class ReportsService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly initialBalanceService: InitialBalanceService,
    private readonly contaInvestimentoService: InvestmentBalanceService,
  ) { }

  /**
   * Agenda financeira mensal com saldo inicial, final e transações ordenadas.
   */
  async getMonthlyAgenda({ year, month }: GetMonthlyAgendaDto, ownerId: string) {
    const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate();
    const endDate = dayjs(startDate).endOf('month').toDate();

    // Transações do mês filtradas por ownerId
    const transactions = await this.transactionService.findByPeriod(startDate, endDate, ownerId);

    // Saldo acumulado anterior ao mês para o ownerId
    const previousTransactions = await this.transactionService.findBeforeDate(startDate, ownerId);
    const initialBalance = await this.initialBalanceService.get(ownerId);
    const saldoInicial = initialBalance?.valor || 0;

    const totalCreditsBefore = previousTransactions
      .filter(t => t.tipo === TransactionType.CREDITO)
      .reduce((sum, t) => sum + t.valor, 0);

    const totalDebitsBefore = previousTransactions
      .filter(t => t.tipo === TransactionType.DEBITO)
      .reduce((sum, t) => sum + t.valor, 0);

    const saldoAntesDoMes = saldoInicial + totalCreditsBefore - totalDebitsBefore;

    // Saldo final do mês
    const creditosMes = transactions
      .filter(t => t.tipo === TransactionType.CREDITO)
      .reduce((sum, t) => sum + t.valor, 0);

    const debitosMes = transactions
      .filter(t => t.tipo === TransactionType.DEBITO)
      .reduce((sum, t) => sum + t.valor, 0);

    const saldoFinalMes = saldoAntesDoMes + creditosMes - debitosMes;

    // Ordena por data
    transactions.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    return {
      saldoInicial: saldoAntesDoMes,
      saldoFinal: saldoFinalMes,
      transacoes: transactions,
    };
  }

  /**
   * Relatório analítico por período com gráfico mensal de receitas, despesas e saldo.
   */
  /*async getSummary(ownerId: string, startDate: Date, endDate: Date) {
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    const transacoes = await this.transactionService.findByPeriod(start,end,ownerId);
  
    let despesas = 0;
    let receitas = 0;
    const evolucao: { mes: string; despesas: number; receitas: number; saldo: number }[] = [];
  
    const agrupado = new Map<string, { despesas: number; receitas: number }>();
  
    transacoes.forEach((t) => {
      const mes = `${t.data.getFullYear()}-${String(t.data.getMonth() + 1).padStart(2, '0')}`;
      const valor = t.valor;
  
      if (!agrupado.has(mes)) {
        agrupado.set(mes, { despesas: 0, receitas: 0 });
      }
  
      if (t.tipo === 'débito') {
        agrupado.get(mes)!.despesas += valor;
        despesas += valor;
      } else {
        agrupado.get(mes)!.receitas += valor;
        receitas += valor;
      }
    });
  
    let saldoAcumulado = 0;
    agrupado.forEach((val, mes) => {
      saldoAcumulado += val.receitas - val.despesas;
      evolucao.push({
        mes,
        despesas: val.despesas,
        receitas: val.receitas,
        saldo: saldoAcumulado,
      });
    });
  
    const contaInvestimento = await this.investmentBalanceService.get( ownerId );
  
    return {
      evolucao,
      resumo: {
        despesas,
        receitas,
        saldoFinal: receitas - despesas,
        saldoContaInvestimento: contaInvestimento?.valor || 0,
      },
    };
  }*/

  async getSummary(ownerId: string, dataInicial: string, dataFinal: string): Promise<SummaryResponseDto> {
  const startDate = new Date(dataInicial);
  const endDate = new Date(dataFinal);

  const transacoes = await this.transactionService.findByPeriod(startDate, endDate, ownerId);

  let despesas = 0;
  let receitas = 0;

  const evolucaoMap = new Map<string, { despesas: number, receitas: number }>();

  for (const transacao of transacoes) {
    const data = new Date(transacao.data);
    const mesAno = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;

    if (!evolucaoMap.has(mesAno)) {
      evolucaoMap.set(mesAno, { despesas: 0, receitas: 0 });
    }

    const stats = evolucaoMap.get(mesAno)!;

    if (transacao.tipo === 'débito') {
      stats.despesas += transacao.valor;
      despesas += transacao.valor;
    } else if (transacao.tipo === 'crédito') {
      stats.receitas += transacao.valor;
      receitas += transacao.valor;
    }
  }

  const saldoInicial = await this.initialBalanceService.get(ownerId);
  const contaInvestimento = (await this.contaInvestimentoService.get(ownerId)).valor;

  let saldoAcumulado = Number(saldoInicial.valor);

  const evolucao: EvolucaoMensalDto[] = [];

  let current = new Date(startDate);
  current.setDate(1); // sempre dia 1
  endDate.setDate(1); // idem

  while (!isBefore(endDate, current)) {
    const mesAno = format(current, 'yyyy-MM');
    const valores = evolucaoMap.get(mesAno) || { despesas: 0, receitas: 0 };

    saldoAcumulado += (valores.receitas - valores.despesas);

    evolucao.push({
      mesAno,
      despesas: valores.despesas,
      receitas: valores.receitas,
      saldo: saldoAcumulado
    });

    current = addMonths(current, 1);
  }

  const saldoFinal = saldoAcumulado;

  console.log(evolucao,
   
      despesas,
      receitas,
      saldoFinal,
      contaInvestimento
    );

  return {
    evolucao,
    resumo: {
      despesas,
      receitas,
      saldoFinal,
      contaInvestimento
    }
  };
}

}
