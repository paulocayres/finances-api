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
  @IsOptional()
  recorrencia?: RecurrenceType;

  @IsOptional()
  @IsNumber()
  @Min(2)
  numeroParcelas?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  numeroParcela?: number; // Preenchido pelo backend para parcelas

  @IsEnum(PeriodUnit)
  @IsOptional()
  unidadePeriodo?: PeriodUnit;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantidadePeriodo?: number;

  @IsString()
  @IsOptional()
  groupId?: string;
}
