import { PartialType } from '@nestjs/mapped-types';
import { CreateInitialBalanceDto } from './create-initial-balance.dto';

export class UpdateInitialBalanceDto extends PartialType(CreateInitialBalanceDto) {}
