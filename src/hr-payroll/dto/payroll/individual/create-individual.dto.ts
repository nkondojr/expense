import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsDecimal, IsEnum, IsInt, IsNotEmpty, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { CalculatedFrom, DeductionNature } from 'src/hr-payroll/entities/payroll/general-deductions.entity';
import { CreatePayrollAccountDto } from '../accounts/create-payroll-account.dto';

export class CreateIndividualDeductionDto {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    name: string; // Deduction name

    @IsUUID()
    @IsNotEmpty()
    employeeId: string;

    @IsDecimal({ decimal_digits: '1,4', force_decimal: true })
    @IsNotEmpty()
    value: string; // Deduction value

    @IsDateString()
    @IsNotEmpty()
    effectiveDate: string; // Effective date of the deduction

    @IsInt()
    @IsNotEmpty()
    deductionPeriod: number; // Deduction period

    @IsEnum(['Employee Deduction', 'Employee Earning'])
    @IsNotEmpty()
    type: 'Employee Deduction' | 'Employee Earning'; // Type of deduction

    @IsEnum(DeductionNature)
    @IsNotEmpty()
    nature: DeductionNature; // Nature of deduction

    @IsEnum(CalculatedFrom)
    @IsNotEmpty()
    calculateFrom: CalculatedFrom; // Deduction calculation base

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePayrollAccountDto)
    @IsNotEmpty()
    payrollAccounts: CreatePayrollAccountDto[];
}
