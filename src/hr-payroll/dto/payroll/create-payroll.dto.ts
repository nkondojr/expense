import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
} from 'class-validator';
import { CreatePayrollItemDto } from './items/create-payroll-item.dto';

export class CreatePayrollDto {
    @IsOptional()
    financialYearId?: number; // Reference to the FinancialYear entity, optional

    @IsDateString()
    @IsNotEmpty()
    date: Date; // Payroll date in ISO format

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePayrollItemDto)
    @IsNotEmpty()
    payrollItems: CreatePayrollItemDto[];
}
