import { Module } from '@nestjs/common';
import { ContaInvestimentoService } from './conta-investimento.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ContaInvestimento, ContaInvestimentoSchema } from './entities/conta-investimento.entity';
import { ContaInvestimentoController } from './conta-investimento.controller';
//import { ContaInvestimentoController } from './conta-investimento.controller';

@Module({
    imports: [
      MongooseModule.forFeature([
        { name: ContaInvestimento.name, schema: ContaInvestimentoSchema },
      ]),
    ],
  controllers: [ContaInvestimentoController],
  providers: [ContaInvestimentoService],
})
export class ContaInvestimentoModule {}
