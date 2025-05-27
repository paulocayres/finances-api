export class ResumoFinanceiroDto {
  despesas: number;          // Total geral de despesas no período
  receitas: number;          // Total geral de receitas no período
  saldoFinal: number;        // Saldo final ao fim do período
  contaInvestimento: number; // Valor atual da conta de investimento
}