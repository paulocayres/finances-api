


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContaInvestimentoDocument = ContaInvestimento & Document;

@Schema()
export class ContaInvestimento {
  @Prop({ required: true })
  valor: number;

  @Prop({ required: true })
  data: Date;
}

export const ContaInvestimentoSchema = SchemaFactory.createForClass(ContaInvestimento);