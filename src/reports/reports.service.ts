import { Injectable } from '@nestjs/common';
import { InitialBalanceService } from 'src/initial-balance/initial-balance.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { GetMonthlyAgendaDto } from './dto/GetMonthlyAgendaDto';
import { TransactionType } from 'src/transaction/enums';
import * as dayjs from 'dayjs';

@Injectable()
export class ReportsService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly initialBalanceService: InitialBalanceService,
  ) {}

  /**
   * Agenda financeira mensal com saldo inicial, final e transações ordenadas.
   */
  async getMonthlyAgenda({ year, month }: GetMonthlyAgendaDto) {
    const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate();
    const endDate = dayjs(startDate).endOf('month').toDate();

    // Transações do mês
    const transactions = await this.transactionService.findByPeriod(startDate, endDate);

    // Saldo acumulado anterior ao mês
    const previousTransactions = await this.transactionService.findBeforeDate(startDate);
    const initialBalance = await this.initialBalanceService.get();
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
  async getSummaryByPeriod(start: Date, end: Date) {
    const transacoes = await this.transactionService.findByPeriod(start, end);

    const resumo = {
      totalReceitas: 0,
      totalDespesas: 0,
      saldoFinal: 0,
    };

    // Agrupar por mês
    const porMes = new Map<string, { receitas: number; despesas: number }>();

    for (const transacao of transacoes) {
      const mes = `${transacao.data.getFullYear()}-${String(transacao.data.getMonth() + 1).padStart(2, '0')}`;

      if (!porMes.has(mes)) {
        porMes.set(mes, { receitas: 0, despesas: 0 });
      }

      const item = porMes.get(mes)!;

      if (transacao.tipo === TransactionType.CREDITO) {
        item.receitas += transacao.valor;
        resumo.totalReceitas += transacao.valor;
      } else if (transacao.tipo === TransactionType.DEBITO) {
        item.despesas += transacao.valor;
        resumo.totalDespesas += transacao.valor;
      }
    }

    // Organizar gráfico com saldo acumulado
    const chartTemp = Array.from(porMes.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, valores]) => ({
        month: mes,
        receitas: valores.receitas,
        despesas: valores.despesas,
      }));

    let saldoAcumulado = 0;
    const chart = chartTemp.map((item) => {
      saldoAcumulado += item.receitas - item.despesas;
      return { ...item, saldo: saldoAcumulado };
    });

    if (chart.length > 0) {
      resumo.saldoFinal = chart[chart.length - 1].saldo;
    }

    return {
      chart,
      resumo,
    };
  }
}
