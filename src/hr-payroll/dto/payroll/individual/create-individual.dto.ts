import { IsDateString, IsDecimal, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { CalculatedFrom, DeductionNature } from 'src/hr-payroll/entities/payroll/generals.entity';

export class CreateIndividualDeductionDto {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    name: string; // Deduction name

    @IsInt()
    @IsNotEmpty()
    employeeId: number; // Foreign key to Employee entity

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
}
