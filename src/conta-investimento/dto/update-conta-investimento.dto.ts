import { PartialType } from '@nestjs/mapped-types';
import { CreateContaInvestimentoDto } from './create-conta-investimento.dto';

export class UpdateContaInvestimentoDto extends PartialType(CreateContaInvestimentoDto) {}
