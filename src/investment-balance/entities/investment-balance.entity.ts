import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InvestmentBalanceDocument = InvestmentBalance & Document;

@Schema()
export class InvestmentBalance {
  @Prop({ required: true })
  valor: number;

  @Prop({ required: true })
  data: Date;

  @Prop({ required: true, index: true })
  ownerId: string;  // id do usuário proprietário do saldo inicial
}

export const InvestmentBalanceSchema = SchemaFactory.createForClass(InvestmentBalance);
