import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  Min,
  IsNotEmpty,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

import { TransactionType, RecurrenceType, PeriodUnit } from '../enums';

export class CreateTransactionDto {
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

  @IsEnum(RecurrenceType)
  @IsNotEmpty()
  recorrencia?: RecurrenceType;

  @IsOptional()
  @IsNumber()
  @Min(2)
  @IsNotEmpty()
  numeroParcelas?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @IsNotEmpty()
  numeroParcela?: number; // preenchido pelo backend em transações parceladas

  @IsEnum(PeriodUnit)
  @IsOptional()
  @IsNotEmpty()
  unidadePeriodo?: PeriodUnit;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @IsNotEmpty()
  quantidadePeriodo?: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  groupId?: string; // Adiciona o campo groupId como opcional

}


