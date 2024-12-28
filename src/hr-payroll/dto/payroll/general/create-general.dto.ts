import { IsDecimal, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { CompensationType, TransactionType, CompensationNature, CalculatedFrom  } from 'src/hr-payroll/entities/payroll/generals.entity';

export class CreateGeneralDeductionDto {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    name: string; // Deduction name

    @IsEnum(CompensationType)
    @IsNotEmpty()
    type: CompensationType; // Compensation type

    @IsEnum(TransactionType)
    @IsNotEmpty()
    transactionType: TransactionType; // Transaction type

    @IsEnum(CompensationNature)
    @IsNotEmpty()
    nature: CompensationNature; // Nature of compensation

    @IsDecimal({ decimal_digits: '1,4', force_decimal: true })
    @IsNotEmpty()
    value: string; // Deduction value

    @IsEnum(CalculatedFrom)
    @IsOptional()
    calculateFrom?: CalculatedFrom; // Compensation calculation base (optional)
}
