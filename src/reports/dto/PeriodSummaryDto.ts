export class PeriodSummaryDto {
  grafico: {
    labels: string[];
    receitas: number[];
    despesas: number[];
    saldo: number[];
  };
  resumo: {
    totalReceitas: number;
    totalDespesas: number;
    saldoFinal: number;
  };
}