import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { EndReason } from 'src/hr-payroll/entities/employees/contracts.entity';

export class CreateContractDto {
    @IsUUID()
    @IsOptional()
    employeeId: string;

    @IsDateString()
    @IsNotEmpty()
    appointmentDate: Date;

    @IsDateString()
    @IsNotEmpty()
    contractEndDate: Date;

    @IsDateString()
    @IsOptional()
    retirementDate?: Date;

    @IsEnum(EndReason)
    @IsOptional()
    endOfContractReason: EndReason;

    @IsString()
    @IsOptional()
    attachment?: string;
}
