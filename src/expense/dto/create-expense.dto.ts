import { IsDateString, IsDecimal, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateExpenseItemDto } from 'src/expense_items/dto/create-expense_item.dto';

export class CreateExpenseDto {
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsDecimal()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  attachment?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateExpenseItemDto)
  @IsNotEmpty()
  expenseItems: CreateExpenseItemDto[];
}
