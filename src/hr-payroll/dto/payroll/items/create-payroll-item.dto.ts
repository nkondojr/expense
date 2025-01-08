import { IsArray, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreatePayrollItemDto {
  @IsArray()
  @IsNotEmpty({ each: true }) // Ensures the array is not empty and each ID is provided
  employeeId: string; // Array of Employee IDs
}
