import {
    IsArray,
    IsDateString,
    IsDecimal,
    IsNotEmpty,
    IsOptional,
} from 'class-validator';

export class CreatePayrollDto {
    @IsOptional()
    financialYearId?: number; // Reference to the FinancialYear entity, optional

    @IsArray()
    @IsNotEmpty({ each: true }) // Ensures the array is not empty and each ID is provided
    employeeIds: number[]; // Array of Employee IDs

    @IsDateString()
    @IsNotEmpty()
    date: string; // Payroll date in ISO format
}
