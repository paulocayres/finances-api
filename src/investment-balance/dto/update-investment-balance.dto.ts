import { PartialType } from '@nestjs/mapped-types';
import { CreateInvestmentBalanceDto } from './create-investment-balance.dto';

export class UpdateInvestmentBalanceDto extends PartialType(CreateInvestmentBalanceDto) {}
