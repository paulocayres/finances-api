import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongooseEncryption from 'mongoose-encryption';

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

const encKey = process.env.MONGO_ENC_KEY || 'minha-chave-secreta-32bytes';
InvestmentBalanceSchema.plugin(mongooseEncryption, {
  secret: encKey,
});
