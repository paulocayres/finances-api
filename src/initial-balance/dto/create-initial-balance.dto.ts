import { IsDateString, IsNumber } from 'class-validator';

export class CreateInitialBalanceDto {
  @IsNumber()
  valor: number;

  @IsDateString()
  data: string;
}
