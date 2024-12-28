import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateContractDto {
    @IsNotEmpty()
    employeeId: number; // Reference to the Employee entity, sent as an ID

    @IsDate()
    @IsNotEmpty()
    appointmentDate: Date;

    @IsDate()
    @IsNotEmpty()
    contractEndDate: Date;

    @IsDate()
    @IsOptional()
    retirementDate?: Date;

    @IsEnum(['End of Contract', 'Resignation', 'Retirement', 'Termination', 'Death'])
    @IsOptional()
    endOfContractReason?: string;

    @IsString()
    @IsOptional()
    @Length(1, 255)
    attachment?: string; // File path to the attachment
}
