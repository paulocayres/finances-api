import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { FirebaseAuthGuard } from 'src/firebase/firebase-auth.guard';
import { Request } from 'express';

@Controller('transactions')
@UseGuards(FirebaseAuthGuard) // ✅ Protege todas as rotas
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() createDto: CreateTransactionDto, @Req() req: Request) {
    const user = req['user'];
    const ownerId = user.uid;
    return this.transactionService.create(createDto, ownerId);
  }

  @Get('by-period')
  async findByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: Request,
  ): Promise<Transaction[]> {
    if (!startDate || !endDate) {
      throw new BadRequestException('As datas de início e fim são obrigatórias.');
    }

    const user = req['user'];
    const ownerId = user.uid;

    return this.transactionService.findByPeriod(
      new Date(startDate),
      new Date(endDate),
      ownerId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'];
    const ownerId = user.uid;
    return this.transactionService.findOne(id, ownerId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTransactionDto,
    @Req() req: Request,
  ) {
    const user = req['user'];
    const ownerId = user.uid;
    return this.transactionService.update(id, updateDto, ownerId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'];
    const ownerId = user.uid;
    return this.transactionService.remove(id, ownerId);
  }
}
