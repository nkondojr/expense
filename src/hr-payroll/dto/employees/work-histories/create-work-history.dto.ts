import {
    IsDate,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';

export class CreateWorkHistoryDto {
    @IsNotEmpty()
    employeeId: number; // Reference to the Employee entity, sent as an ID

    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    company: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 200)
    address: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 200)
    jobTitle: string;

    @IsDate()
    @IsNotEmpty()
    startDate: Date;

    @IsDate()
    @IsOptional()
    endDate?: Date;

    @IsString()
    @IsNotEmpty()
    @Length(1, 15)
    telephone: string;

    @IsEmail()
    @IsNotEmpty()
    @Length(1, 255)
    email: string;
}
