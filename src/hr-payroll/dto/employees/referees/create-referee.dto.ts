import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';

export class CreateRefereeDto {
    @IsNotEmpty()
    employeeId: number; // Reference to the Employee entity, sent as an ID

    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    name: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    address: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 12)
    mobile: string;

    @IsEnum(['Mr', 'Mrs', 'Ms', 'Prof', 'Dr', 'Miss'])
    @IsOptional()
    title?: string;

    @IsEmail()
    @IsNotEmpty()
    email: string; // Unique constraint handled at the database level

    @IsString()
    @IsNotEmpty()
    @Length(1, 200)
    organisation: string;
}
