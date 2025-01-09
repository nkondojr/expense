import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';

export class CreatePayrollAccountDto {
  @IsEnum(['General', 'Individual'])
  @IsNotEmpty()
  type: 'General' | 'Individual'; // Type of deduction

  @IsArray()
  @IsNotEmpty({ each: true }) // Ensures the array is not empty and each ID is provided
  liabilityAccountId: string; // Array of Employee IDs

  @IsArray()
  @IsNotEmpty({ each: true }) // Ensures the array is not empty and each ID is provided
  expenseAccountId: string; // Array of Employee IDs
}
