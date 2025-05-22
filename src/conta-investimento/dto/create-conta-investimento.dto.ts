import { IsDateString, IsNumber } from 'class-validator';

export class CreateContaInvestimentoDto {
  @IsNumber()
  valor: number;

  @IsDateString()
  data: string;
}
