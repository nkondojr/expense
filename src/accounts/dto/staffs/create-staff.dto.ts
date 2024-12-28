import {
  IsString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  empNo: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsNotEmpty()
  mobile: number;

  @IsOptional()
  createdBy?: User;

  @IsOptional()
  updatedBy?: User;
}
