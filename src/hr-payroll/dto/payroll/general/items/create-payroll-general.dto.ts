import { IsArray, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreatePayrollGeneralDto {
  @IsNumber()
  @IsNotEmpty()
  amount: string;

  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @IsUUID()
  @IsNotEmpty()
  generalId: string;

  @IsUUID()
  @IsNotEmpty()
  payrollId: string;
}
