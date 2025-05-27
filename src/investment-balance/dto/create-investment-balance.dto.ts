import { IsDateString, IsNumber } from 'class-validator';

export class CreateInvestmentBalanceDto {
  @IsNumber()
  valor: number;

  @IsDateString()
  data: string;
}
