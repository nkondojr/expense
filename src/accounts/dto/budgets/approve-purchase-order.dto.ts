import { IsDateString, IsNotEmpty } from 'class-validator';

export class ApproveOrderDto {
  @IsNotEmpty({ message: 'Approval date is required' })
  @IsDateString({}, { message: 'Approval date must be a valid date string' })
  date: Date;
}
