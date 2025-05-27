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
  async getResumo(
    @Query('startDate') dataInicial: string,
    @Query('endDate') dataFinal: string,
    @Req() req: Request,
  ) {
    const user = req['user'];
    const ownerId = user.uid;
    console.log('Usuário autenticado:', user);
    return this.reportsService.getSummary(ownerId, dataInicial, dataFinal);
  }
}
