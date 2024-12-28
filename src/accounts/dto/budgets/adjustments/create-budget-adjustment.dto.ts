import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsDate,
  IsArray,
  ValidateNested,
  IsDateString,
  IsInt,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBudgetAdjustmentItemDto } from './items/create-budget-adjustment-item.dto';

export class CreateBudgetAdjustmentDto {
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsInt({ message: 'budgetId must be an integer' })
  @IsNotEmpty({ message: 'budgetId should not be empty' })
  budgetId: number;

  @IsDecimal({ decimal_digits: '0,4' })
  @IsOptional()
  totalExpenseAmount?: string;

  @IsDecimal({ decimal_digits: '0,4' })
  @IsOptional()
  totalIncomeAmount?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  attachment?: string;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @IsUUID()
  @IsOptional()
  approvedBy?: string;

  @IsDate()
  @IsOptional()
  approvedAt?: Date;

  @IsUUID()
  @IsOptional()
  createdBy?: string;

  @IsUUID()
  @IsOptional()
  updatedBy?: string;

  @IsArray({ message: 'expenseBudgetItems must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetAdjustmentItemDto)
  @IsNotEmpty({ message: 'expenseBudgetItems should not be empty' })
  expenseBudgetItems: CreateBudgetAdjustmentItemDto[];

  @IsArray({ message: 'incomeBudgetItems must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetAdjustmentItemDto)
  @IsNotEmpty({ message: 'incomeBudgetItems should not be empty' })
  incomeBudgetItems: CreateBudgetAdjustmentItemDto[];

  @IsString() // Add validation if status is a string
  @IsOptional() // If status can be optional, add this decorator
  status?: string;
}
