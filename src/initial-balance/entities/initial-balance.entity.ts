import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InitialBalanceDocument = InitialBalance & Document;

@Schema()
export class InitialBalance {
  @Prop({ required: true })
  valor: number;

  @Prop({ required: true })
  data: Date;

  @Prop({ required: true, index: true })
  ownerId: string;  // id do usuário proprietário do saldo inicial
}

export const InitialBalanceSchema = SchemaFactory.createForClass(InitialBalance);
