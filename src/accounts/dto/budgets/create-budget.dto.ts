import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsDate,
  IsArray,
  ValidateNested,
  IsInt,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBudgetItemDto } from './items/create-budget-item.dto';

export class CreateBudgetDto {
  @IsInt({ message: 'financialYearId must be an integer' })
  @IsNotEmpty({ message: 'financialYearId should not be empty' })
  financialYearId: number;

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

  @IsArray({ message: 'expenseAccounts must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetItemDto)
  @IsNotEmpty({ message: 'expenseAccounts should not be empty' })
  expenseAccounts: CreateBudgetItemDto[];

  @IsArray({ message: 'incomeAccounts must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetItemDto)
  @IsNotEmpty({ message: 'incomeAccounts should not be empty' })
  incomeAccounts: CreateBudgetItemDto[];

  @IsString() // Add validation if status is a string
  @IsOptional() // If status can be optional, add this decorator
  status?: string;
}
