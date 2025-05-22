import { Controller, Get, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ParseDatePipe } from 'src/pipes/parse-date.pipe';


@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('monthly-agenda')
  async getMonthlyAgenda(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.reportsService.getMonthlyAgenda({ year, month });
  }

  @Get('summary')
  async getSummaryByPeriod(
    @Query('start', ParseDatePipe) start: Date,
    @Query('end', ParseDatePipe) end: Date,
  ) {

    if (start > end) {
      throw new BadRequestException('A data inicial deve ser anterior à data final.');
    }
    return this.reportsService.getSummaryByPeriod(start, end);
  }


}
