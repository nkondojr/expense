import {
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Length,
} from 'class-validator';
import { GradeType, QualificationType } from 'src/hr-payroll/entities/employees/qualifications.entity';

export class CreateQualificationDto {
    @IsUUID()
    @IsOptional()
    employeeId: string;

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

    @IsDateString()
    @IsNotEmpty()
    startDate: Date;

    @IsDateString()
    @IsNotEmpty()
    endDate: Date;

    @IsDateString()
    @IsOptional()
    dateAwarded?: Date;

    @IsString()
    @IsOptional()
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
