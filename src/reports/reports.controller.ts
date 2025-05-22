import { Controller, Get, Query, ParseIntPipe, BadRequestException, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ParseDatePipe } from 'src/pipes/parse-date.pipe';
import { Request } from 'express';


@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly-agenda')
  async getMonthlyAgenda(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Req() req: Request,
  ) {
    console.log('Recebido year:', year, 'month:', month);
    const user = req['user'];
    const ownerId = user.uid;
    console.log('Usuário autenticado:', user);
    if (!ownerId) {
      throw new BadRequestException('Usuário não autenticado.');
    }
    return this.reportsService.getMonthlyAgenda({ year, month }, ownerId);
  }

  @Get('summary')
  async getSummaryByPeriod(
    @Query('start', ParseDatePipe) start: Date,
    @Query('end', ParseDatePipe) end: Date,
    @Req() req: Request,
  ) {
    if (start > end) {
      throw new BadRequestException('A data inicial deve ser anterior à data final.');
    }

      const user = req['user'];
    const ownerId = user.uid;
    if (!ownerId) {
      throw new BadRequestException('Usuário não autenticado.');
    }

    return this.reportsService.getSummaryByPeriod(start, end, ownerId);
  }
}
