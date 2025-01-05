import {
    IsArray,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    ValidateNested,
} from 'class-validator';
import { EmployeeTitle, MaritalStatus, EmploymentType, IDType } from '../../entities/employees/employees.entity';
import { CreateContractDto } from './contracts/create-contract.dto';
import { CreateAllocationDto } from './allocations/create-allcocation.dto';
import { CreateQualificationDto } from './qualifications/create-qualification.dto';
import { Type } from 'class-transformer';

export class CreateEmployeeDto {
    @IsEnum(EmployeeTitle)
    @IsNotEmpty()
    title: EmployeeTitle;

    @IsNotEmpty()
    userId: string; // Reference to the `User` entity, likely sent as an ID

    @IsDateString()
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

    @IsDateString()
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
    attachment?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateContractDto)
    @IsNotEmpty()
    contracts: CreateContractDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAllocationDto)
    @IsNotEmpty()
    allocations: CreateAllocationDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQualificationDto)
    @IsNotEmpty()
    qualifications: CreateQualificationDto[];
}