import {
    IsNotEmpty,
    IsString,
    IsUUID,
    Length,
} from 'class-validator';

export class CreateEmployeeBankDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    employeeId: string; // Reference to the Employee entity, sent as an ID

    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    bankName: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    accountName: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    accountNumber: string; // Unique constraint will be handled at the database level

    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    accountBranch: string;
}
