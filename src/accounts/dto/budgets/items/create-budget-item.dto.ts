import { IsDecimal, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBudgetItemDto {
  @IsNumber()
  @IsNotEmpty({ message: 'accountId should not be empty' })
  accountId: number;

  @IsDecimal({ decimal_digits: '0,4' })
  @IsNotEmpty({ message: 'amount should not be empty' })
  amount: string;
}
