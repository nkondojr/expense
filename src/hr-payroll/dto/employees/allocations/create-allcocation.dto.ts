import {
    IsDecimal,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Length,
} from 'class-validator';

export class CreateAllocationDto {
    @IsUUID()
    @IsOptional()
    employeeId: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 200)
    department: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    jobTitle: string;

    @IsDecimal({ decimal_digits: '1,4' })
    @IsNotEmpty()
    basicSalary: string; // Ensure the salary is a decimal value
}
