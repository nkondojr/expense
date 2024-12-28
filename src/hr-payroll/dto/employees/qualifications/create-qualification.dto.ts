import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';
import { GradeType, QualificationType } from 'src/hr-payroll/entities/employees/qualifications.entity';

export class CreateQualificationDto {
    @IsNotEmpty()
    employeeId: number; // Reference to the Employee entity, sent as an ID

    @IsEnum(QualificationType)
    @IsNotEmpty()
    type: QualificationType;

    @IsString()
    @IsOptional()
    @Length(1, 255)
    educationLevel?: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    institutionName: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    country: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    programName: string;

    @IsDate()
    @IsNotEmpty()
    startDate: Date;

    @IsDate()
    @IsNotEmpty()
    endDate: Date;

    @IsDate()
    @IsOptional()
    dateAwarded?: Date;

    @IsString()
    @IsOptional()
    @Length(1, 255)
    attachment?: string;

    @IsEnum(GradeType)
    @IsNotEmpty()
    gradeType: GradeType;

    @IsString()
    @IsOptional()
    @Length(1, 30)
    grade?: string;

    @IsString()
    @IsOptional()
    @Length(1, 20)
    gradePoints?: string;
}
