import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
import { TransactionType } from '../enums';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
 @IsString()
  @MinLength(5)
  @MaxLength(100)
  @IsNotEmpty()
  descricao: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  valor: number;

  @IsDateString()
  @IsNotEmpty()
  data: Date;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  tipo: TransactionType;
}
