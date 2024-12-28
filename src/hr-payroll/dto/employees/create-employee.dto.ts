import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';
import { EmployeeTitle, MaritalStatus, EmploymentType, IDType } from '../../entities/employees/employees.entity';

export class CreateEmployeeDto {
    @IsEnum(EmployeeTitle)
    @IsNotEmpty()
    title: EmployeeTitle;

    @IsNotEmpty()
    userId: number; // Reference to the `User` entity, likely sent as an ID

    @IsDate()
    @IsNotEmpty()
    dob: Date;

    @IsString()
    @IsOptional()
    @Length(1, 20)
    placeOfBirth?: string;

    @IsEnum(MaritalStatus)
    @IsNotEmpty()
    maritalStatus: MaritalStatus;

    @IsEnum(EmploymentType)
    @IsNotEmpty()
    employmentType: EmploymentType;

    @IsEnum(IDType)
    @IsNotEmpty()
    idType: IDType;

    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    idNumber: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 50)
    regNumber: string;

    @IsNumber()
    @IsOptional()
    tin?: number;

    @IsDate()
    @IsOptional()
    employmentDate?: Date;

    @IsString()
    @IsOptional()
    @Length(1, 20)
    employmentNumber?: string;

    @IsString()
    @IsOptional()
    @Length(1, 50)
    pensionNumber?: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 50)
    region: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 50)
    district: string;

    @IsString()
    @IsOptional()
    @Length(1, 50)
    ward?: string;

    @IsString()
    @IsOptional()
    @Length(1, 100)
    street?: string;

    @IsString()
    @IsOptional()
    @Length(1, 255)
    attachment?: string; // File path to the attachment

    @IsOptional()
    createdById?: number; // Reference to the `createdBy` user

    @IsOptional()
    updatedById?: number; // Reference to the `updatedBy` user
}
