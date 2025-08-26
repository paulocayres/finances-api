import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongooseEncryption from 'mongoose-encryption';

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

const encKey = process.env.MONGO_ENC_KEY || 'minha-chave-secreta-32bytes';
InitialBalanceSchema.plugin(mongooseEncryption, {
  secret: encKey
});
