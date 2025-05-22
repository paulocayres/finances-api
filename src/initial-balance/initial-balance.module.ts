import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InitialBalanceService } from './initial-balance.service';
import { InitialBalanceController } from './initial-balance.controller';
import { InitialBalance, InitialBalanceSchema } from './entities/initial-balance.entity';
//import { InitialBalance, InitialBalanceSchema } from './schemas/initial-balance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InitialBalance.name, schema: InitialBalanceSchema },
    ]),
  ],
  controllers: [InitialBalanceController],
  providers: [InitialBalanceService],
  exports: [InitialBalanceService],
})
export class InitialBalanceModule {}

