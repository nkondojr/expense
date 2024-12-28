import { IsDecimal, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateJournalEntryItemDto {
  @IsNumber()
  @IsNotEmpty()
  creditAccountId: number;

  @IsNumber()
  @IsNotEmpty()
  debtAccountId: number;

  @IsDecimal({ decimal_digits: '0,4' })
  @IsNotEmpty()
  amount: string;
}
