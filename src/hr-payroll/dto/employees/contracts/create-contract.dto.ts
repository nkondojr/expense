import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';

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

    @IsEnum(['End of Contract', 'Resignation', 'Retirement', 'Termination', 'Death'])
    @IsOptional()
    endOfContractReason?: string;

    @IsString()
    @IsOptional()
    attachment?: string;
}
