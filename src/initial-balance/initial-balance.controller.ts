import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { InitialBalanceService } from './initial-balance.service';
import { CreateInitialBalanceDto } from './dto/create-initial-balance.dto';
import { InitialBalance } from './entities/initial-balance.entity';
import { FirebaseAuthGuard } from 'src/firebase/firebase-auth.guard';

@Controller('initial-balance')
@UseGuards(FirebaseAuthGuard)
export class InitialBalanceController {
  constructor(private readonly initialBalanceService: InitialBalanceService) {}

  @Get()
  async get(@Req() req): Promise<InitialBalance> {
    const user = req.user;
    return this.initialBalanceService.get(user.uid);
  }

  @Put()
  async upsert(@Req() req, @Body() dto: CreateInitialBalanceDto): Promise<InitialBalance> {
    const user = req.user;
    return this.initialBalanceService.upsert(user.uid, dto);
  }
}
