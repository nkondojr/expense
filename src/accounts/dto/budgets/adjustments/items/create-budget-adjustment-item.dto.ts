import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBudgetAdjustmentItemDto {
  @IsNumber()
  @IsNotEmpty({ message: 'budgetItemId should not be empty' })
  budgetItemId: number;

  @IsDecimal({ decimal_digits: '0,4' })
  @IsNotEmpty({ message: 'CurrentAmount should not be empty' })
  currentAmount: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
