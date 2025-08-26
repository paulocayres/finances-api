import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TransactionType, RecurrenceType, PeriodUnit } from '../enums';
import * as mongooseEncryption from 'mongoose-encryption';

const encKey = process.env.MONGO_ENC_KEY || 'minha-chave-secreta-32bytes';

@Schema()
export class Transaction extends Document {
  @Prop({ required: true })
  descricao: string;

  @Prop({ required: true })
  valor: number;

  @Prop({ required: true, index: true })
  data: Date;

  @Prop({ required: true, enum: TransactionType })
  tipo: TransactionType;

  @Prop({ required: true, enum: RecurrenceType })
  recorrencia: RecurrenceType;

  @Prop()
  numeroParcelas?: number;

  @Prop()
  numeroParcela?: number;

  @Prop({ enum: PeriodUnit })
  unidadePeriodo?: PeriodUnit;

  @Prop()
  quantidadePeriodo?: number;

  @Prop({ required: false })
  groupId: string;

  @Prop({ required: true, index: true })
  ownerId: string;  // ⬅️ Novo campo obrigatório
}

export type TransactionDocument = Transaction & Document;

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.plugin(mongooseEncryption, {
  secret: encKey,
  encryptedFields: ['data', 'descricao', 'valor', 'tipo', 'recorrencia']
});
