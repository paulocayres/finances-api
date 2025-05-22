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
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() createDto: CreateTransactionDto) {
    console.log('entrou no create');
    return this.transactionService.create(createDto);
  }

  /*@Get()
  findAll() {
    return this.transactionService.findAll();
  }*/


  @Get('by-period')
  async findByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Transaction[]> {
    if (!startDate || !endDate) {
      throw new BadRequestException('As datas de início e fim são obrigatórias.');
    }
    
    // Busca transações dentro do intervalo de datas
    return this.transactionService.findByPeriod(new Date(startDate), new Date(endDate));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('entrou no get');
    return this.transactionService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTransactionDto,
  ) {
    return this.transactionService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(id);
  }
}
