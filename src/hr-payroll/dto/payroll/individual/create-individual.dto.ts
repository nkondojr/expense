import { IsDateString, IsDecimal, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { CalculatedFrom, CompensationNature } from 'src/hr-payroll/entities/payroll/generals.entity';

export class CreateIndividualDeductionDto {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    name: string; // Compensation name

    @IsInt()
    @IsNotEmpty()
    employeeId: number; // Foreign key to Employee entity

    @IsDecimal({ decimal_digits: '1,4', force_decimal: true })
    @IsNotEmpty()
    value: string; // Compensation value

    @IsDateString()
    @IsNotEmpty()
    effectiveDate: string; // Effective date of the compensation

    @IsInt()
    @IsNotEmpty()
    deductionPeriod: number; // Deduction period

    @IsEnum(['Employee Deduction', 'Employee Earning'])
    @IsNotEmpty()
    type: 'Employee Deduction' | 'Employee Earning'; // Type of compensation

    @IsEnum(CompensationNature)
    @IsNotEmpty()
    nature: CompensationNature; // Nature of compensation

    @IsEnum(CalculatedFrom)
    @IsNotEmpty()
    calculateFrom: CalculatedFrom; // Compensation calculation base
}
