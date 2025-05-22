import { IsDateString } from 'class-validator';

export class GetSummaryByPeriodDto {
  @IsDateString()
  start: string;

  @IsDateString()
  end: string;
}
