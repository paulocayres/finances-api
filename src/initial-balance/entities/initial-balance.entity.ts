import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InitialBalanceDocument = InitialBalance & Document;

@Schema()
export class InitialBalance {
  @Prop({ required: true })
  valor: number;

  @Prop({ required: true })
  data: Date;
}

export const InitialBalanceSchema = SchemaFactory.createForClass(InitialBalance);
