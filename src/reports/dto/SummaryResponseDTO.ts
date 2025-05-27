import { EvolucaoMensalDto } from "./EvolucaoMensalDTO";
import { ResumoFinanceiroDto } from "./ResumoFinanceiroDTO";

export class SummaryResponseDto {
  evolucao: EvolucaoMensalDto[];         // Lista com todos os meses e saldos
  resumo: ResumoFinanceiroDto;           // Totais gerais
}