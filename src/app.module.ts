import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionModule } from './transaction/transaction.module';
import { InitialBalanceModule } from './initial-balance/initial-balance.module';
import { ContaInvestimentoModule } from './conta-investimento/conta-investimento.module';
import { ReportsModule } from './reports/reports.module';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseAuthGuard } from './firebase/firebase-auth.guard';
import { InvestmentBalanceModule } from './investment-balance/investment-balance.module';
import * as dotenv from 'dotenv';
dotenv.config();

const uri = 'mongodb+srv://paulo_cayres:'+ process.env.MONGO_URI + '@cayres.q7alqy4.mongodb.net/?retryWrites=true&w=majority&appName=Cayres';
console.log(uri);


@Module({
  imports: [MongooseModule.forRoot(uri), TransactionModule, InitialBalanceModule, ContaInvestimentoModule, ReportsModule, InvestmentBalanceModule,],
  controllers: [AppController],
  providers: [AppService,     {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },],
})
export class AppModule {}
