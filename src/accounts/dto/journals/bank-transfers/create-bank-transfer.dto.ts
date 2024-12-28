import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsDate,
  IsDateString,
  IsInt,
  IsDecimal,
} from 'class-validator';

export class CreateBankTransferDto {
  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @IsDecimal({ decimal_digits: '0,4' })
  @IsOptional()
  amount: string;

  @IsString()
  @IsNotEmpty()
  reference?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  attachment?: string;

  @IsInt()
  @IsNotEmpty()
  fromAccountId: number;

  @IsInt()
  @IsNotEmpty()
  toAccountId: number;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @IsUUID()
  @IsOptional()
  approvedBy?: string;

  @IsDate()
  @IsOptional()
  approvedAt?: Date;

  @IsUUID()
  @IsOptional()
  createdBy?: string;

  @IsUUID()
  @IsOptional()
  updatedBy?: string;

  status: string; // Add this field
}
