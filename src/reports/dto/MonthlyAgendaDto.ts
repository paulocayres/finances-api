import { CreateTransactionDto } from "src/transaction/dto/create-transaction.dto";

export class MonthlyAgendaDto {
  year: number;
  month: number;
  transactions: CreateTransactionDto[];
  startingBalance: number;
  endingBalance: number;
}