import { Type } from 'class-transformer';
import { IsArray, IsDecimal, IsEmpty, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { DeductionType, TransactionType, DeductionNature, CalculatedFrom } from 'src/hr-payroll/entities/payroll/general-deductions.entity';
import { CreatePayrollAccountDto } from '../accounts/create-payroll-account.dto';

export class CreateGeneralDeductionDto {
    @IsEmpty()
    number: string;

    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    name: string; // Deduction name

    @IsEnum(DeductionType)
    @IsNotEmpty()
    type: DeductionType; // Deduction type

    @IsEnum(TransactionType)
    @IsNotEmpty()
    transactionType: TransactionType; // Transaction type

    @IsEnum(DeductionNature)
    @IsNotEmpty()
    nature: DeductionNature; // Nature of deduction

    @IsDecimal({ decimal_digits: '1,4', force_decimal: true })
    @IsNotEmpty()
    value: string; // Deduction value

    @IsEnum(CalculatedFrom)
    @IsOptional()
    calculateFrom?: CalculatedFrom; // Deduction calculation base (optional)

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePayrollAccountDto)
    @IsNotEmpty()
    payrollAccounts: CreatePayrollAccountDto[];
}
