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

const uri = "mongodb://localhost:27017/";


@Module({
  imports: [MongooseModule.forRoot(uri), TransactionModule, InitialBalanceModule, ContaInvestimentoModule, ReportsModule,],
  controllers: [AppController],
  providers: [AppService,     {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },],
})
export class AppModule {}
