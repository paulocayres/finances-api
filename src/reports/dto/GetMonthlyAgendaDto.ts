import { IsInt, Min, Max } from 'class-validator';

export class GetMonthlyAgendaDto {
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}